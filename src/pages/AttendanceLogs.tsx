
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { Button } from "@/components/ui/button";

type Department = "IT" | "HR" | "Finance" | "Marketing" | "Operations" | "Sales";

type AttendanceRecord = {
  id: string;
  user_id: string;
  check_in: string;
  check_out: string | null;
  status: "present" | "absent" | "late";
  users: {
    full_name: string;
    department: Department;
  };
};

const AttendanceLogs = () => {
  const [timeRange, setTimeRange] = useState<"weekly" | "monthly">("weekly");
  const [selectedDepartment, setSelectedDepartment] = useState<"all" | Department>("all");

  const getDateRange = () => {
    const today = new Date();
    if (timeRange === "weekly") {
      return {
        start: startOfWeek(today),
        end: endOfWeek(today),
      };
    }
    return {
      start: startOfMonth(today),
      end: endOfMonth(today),
    };
  };

  const { data: attendanceData, isLoading } = useQuery({
    queryKey: ["attendance", timeRange, selectedDepartment],
    queryFn: async () => {
      const { start, end } = getDateRange();
      let query = supabase
        .from("attendance")
        .select(`
          *,
          users (
            full_name,
            department
          )
        `)
        .gte("check_in", start.toISOString())
        .lte("check_in", end.toISOString());

      if (selectedDepartment !== "all") {
        query = query.eq("users.department", selectedDepartment);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as AttendanceRecord[];
    },
  });

  const chartData = attendanceData?.reduce((acc: any[], record) => {
    const date = format(new Date(record.check_in), "MM/dd");
    const existingDate = acc.find(item => item.date === date);
    
    if (existingDate) {
      existingDate[record.status] += 1;
    } else {
      acc.push({
        date,
        present: record.status === "present" ? 1 : 0,
        absent: record.status === "absent" ? 1 : 0,
        late: record.status === "late" ? 1 : 0,
      });
    }
    return acc;
  }, []);

  const chartConfig = {
    present: {
      color: "#22c55e",
    },
    absent: {
      color: "#ef4444",
    },
    late: {
      color: "#f59e0b",
    },
  };

  return (
    <div className="container mx-auto p-8 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Attendance Logs</h1>
          <p className="text-muted-foreground mt-2">View and analyze attendance records</p>
        </div>
        <div className="flex gap-4">
          <Select value={timeRange} onValueChange={(value: "weekly" | "monthly") => setTimeRange(value)}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Select range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedDepartment} onValueChange={(value: "all" | Department) => setSelectedDepartment(value)}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              <SelectItem value="IT">IT</SelectItem>
              <SelectItem value="HR">HR</SelectItem>
              <SelectItem value="Finance">Finance</SelectItem>
              <SelectItem value="Marketing">Marketing</SelectItem>
              <SelectItem value="Operations">Operations</SelectItem>
              <SelectItem value="Sales">Sales</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">Export</Button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Present</CardTitle>
            <CardDescription>Total present attendance</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {attendanceData?.filter(record => record.status === "present").length || 0}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Absent</CardTitle>
            <CardDescription>Total absences</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {attendanceData?.filter(record => record.status === "absent").length || 0}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Late</CardTitle>
            <CardDescription>Late arrivals</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {attendanceData?.filter(record => record.status === "late").length || 0}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Attendance Overview</CardTitle>
          <CardDescription>
            {timeRange === "weekly" ? "Weekly" : "Monthly"} attendance statistics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] mt-4">
            <ChartContainer config={chartConfig}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <ChartTooltip />
                  <Bar dataKey="present" fill="#22c55e" name="Present" />
                  <Bar dataKey="absent" fill="#ef4444" name="Absent" />
                  <Bar dataKey="late" fill="#f59e0b" name="Late" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Detailed Records</CardTitle>
          <CardDescription>Individual attendance records</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Check In
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Check Out
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {attendanceData?.map((record) => (
                  <tr key={record.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {record.users.full_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {record.users.department}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {format(new Date(record.check_in), "MMM dd, yyyy")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {format(new Date(record.check_in), "hh:mm a")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {record.check_out
                        ? format(new Date(record.check_out), "hh:mm a")
                        : "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          record.status === "present"
                            ? "bg-green-100 text-green-800"
                            : record.status === "absent"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AttendanceLogs;
