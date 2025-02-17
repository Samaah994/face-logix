
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload } from "lucide-react";
import * as XLSX from 'xlsx';
import { supabase } from "@/integrations/supabase/client";

const BulkUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const processExcelFile = async (file: File) => {
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet);

        // Process each row and insert into database
        for (const row of jsonData) {
          const { error } = await supabase.from('users').insert({
            full_name: row['Full Name'],
            email: row['Email'],
            department: row['Department'],
          });

          if (error) throw error;
        }

        toast({
          title: "Success",
          description: `Successfully uploaded ${jsonData.length} records`,
        });
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setIsUploading(false);
      }
    };

    reader.onerror = () => {
      toast({
        title: "Error",
        description: "Failed to read file",
        variant: "destructive",
      });
      setIsUploading(false);
    };

    reader.readAsBinaryString(file);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.name.endsWith('.xlsx')) {
      toast({
        title: "Error",
        description: "Please upload an Excel (.xlsx) file",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    await processExcelFile(file);
  };

  return (
    <div className="container mx-auto p-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-green-700">Bulk Upload Users</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Upload an Excel file (.xlsx) containing user data. The file should have columns: Full Name, Email, and Department.
          </p>
          <div className="flex justify-center">
            <Button
              disabled={isUploading}
              onClick={() => document.getElementById('file-upload')?.click()}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Excel File
                </>
              )}
            </Button>
            <input
              id="file-upload"
              type="file"
              accept=".xlsx"
              className="hidden"
              onChange={handleFileUpload}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BulkUpload;
