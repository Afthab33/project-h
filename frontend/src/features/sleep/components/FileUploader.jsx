import React, { useState } from 'react';
import { Upload, AlertCircle, Brain, ArrowRight, Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Papa from 'papaparse';

const FileUploader = ({ onDataProcessed }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isLoadingDemo, setIsLoadingDemo] = useState(false);
  const [error, setError] = useState(null);
  const [fileSelected, setFileSelected] = useState(null);
  
  // Add this new function to load demo data
  const handleLoadDemoData = () => {
    setIsLoadingDemo(true);
    setError(null);
    
    // Use the URL instead of directly importing the CSV
    Papa.parse(sampleDataUrl, {
      download: true,
      header: true,
      complete: (results) => {
        try {
          
          // Process the CSV data using the same function as for uploaded files
          const processedData = processHealthData(results.data);
          
          // Pass the processed data to the parent component
          onDataProcessed(processedData);
          setIsLoadingDemo(false);
        } catch (err) {
          console.error("Error processing demo data:", err);
          setError("Failed to process demo data. Please try uploading your own file.");
          setIsLoadingDemo(false);
        }
      },
      error: (err) => {
        console.error("Error parsing demo CSV:", err);
        setError("Failed to load demo data. Please try uploading your own file.");
        setIsLoadingDemo(false);
      }
    });
  };

  const sampleDataUrl = new URL('@/assets/WearableData.csv', import.meta.url).href;
  
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    setFileSelected(file);
    setError(null);
  };
  
  const handleProcessFile = () => {
    if (!fileSelected) return;
    
    setIsUploading(true);
    setError(null);
    
    Papa.parse(fileSelected, {
      header: true,
      complete: (results) => {
        try {
          // Process the CSV data
          const processedData = processHealthData(results.data);
          onDataProcessed(processedData);
          setIsUploading(false);
        } catch (err) {
          console.error("Error processing data:", err);
          setError("Failed to process file. Please ensure it's a valid Apple Health export.");
          setIsUploading(false);
        }
      },
      error: (err) => {
        console.error("Error parsing CSV:", err);
        setError("Failed to read file. Please try again.");
        setIsUploading(false);
      }
    });
  };
  
  // Process the raw CSV data into usable format
  const processHealthData = (data) => {
     // Log the first row to understand structure
    
    // Filter out rows with no sleep data
    const sleepData = data.filter(row => {
      // Check for common sleep data column names
      return (row['Total Sleep'] && row['Total Sleep'] !== 'NA') || 
             (row['Sleep Duration'] && row['Sleep Duration'] !== 'NA') ||
             (row['Sleep Analysis [Deep] (hr)'] && row['Sleep Analysis [Deep] (hr)'] !== 'NA');
    });
    
    if (sleepData.length === 0) {
      throw new Error("No sleep data found in the uploaded file");
    }
    
    
    
    // Map to more usable structure
    return sleepData.map(row => ({
      date: new Date(row.Date || row.date || row['Start Date']),
      totalSleep: parseFloat(row['Total Sleep'] || row['Sleep Duration'] || 0),
      deepSleep: parseFloat(row['Sleep Analysis [Deep] (hr)'] || row['Deep Sleep'] || 0),
      coreSleep: parseFloat(row['Sleep Analysis [Core] (hr)'] || row['Core Sleep'] || 0),
      remSleep: parseFloat(row['Sleep Analysis [REM] (hr)'] || row['REM Sleep'] || 0),
      awakeDuring: parseFloat(row['Sleep Analysis [Awake] (hr)'] || row['Awake Time'] || 0),
      restingHeartRate: parseFloat(row['Resting Heart Rate (bpm)'] || row['Resting Heart Rate'] || 0),
      respiratoryRate: parseFloat(row['Respiratory Rate (count/min)'] || row['Respiratory Rate'] || 0),
      stepsCount: parseFloat(row['Step Count (steps)'] || row['Steps'] || 0),
      activeEnergy: parseFloat(row['Active Energy (kcal)'] || row['Active Energy'] || 0),
      wristTemperature: parseFloat(row['Apple Sleeping Wrist Temperature (ºF)'] || row['Wrist Temperature'] || 0)
    }));
  };

  return (
    <Card className="bg-white shadow-sm border-0">
      <CardContent className="p-6">
        {error && (
          <div className="mb-5 p-3 bg-red-50 rounded-lg border border-red-100 flex items-start">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-red-800">Error</h4>
              <p className="text-xs text-red-700">{error}</p>
            </div>
          </div>
        )}
        
        {/* Added AI integration callout */}
        <div className="mb-5 p-3 bg-gradient-to-r from-[#4D55CC]/10 to-[#3E7B27]/10 rounded-lg border border-[#4D55CC]/20">
          <div className="flex items-center">
            <Brain className="h-5 w-5 text-[#4D55CC] mr-2" />
            <h4 className="text-sm font-medium">AI Sleep Analysis</h4>
          </div>
          <p className="mt-1 text-xs text-gray-600">
            Upload your health data and Oats AI will analyze your sleep patterns to provide personalized insights and recommendations.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Upload your own data */}
          <div className="flex flex-col items-center justify-center py-8 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50">
            <Upload className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">Upload Your Data</h3>
            <p className="text-sm text-gray-500 mb-4 text-center max-w-md">
              Export your health data from the Apple Health app and upload the CSV file
            </p>
            
            <input 
              type="file" 
              accept=".csv" 
              onChange={handleFileSelect}
              className="hidden" 
              id="file-upload" 
            />
            <div className="flex flex-col items-center gap-3">
              {/* File selection button */}
              <label htmlFor="file-upload" className="cursor-pointer">
                <div className="bg-white border border-gray-200 hover:border-[#4D55CC]/60 text-gray-700 px-4 py-2 rounded-lg transition-all flex items-center">
                  <Upload className="h-4 w-4 mr-2 text-gray-500" />
                  Browse Files
                </div>
              </label>
              
              {/* Show selected file */}
              {fileSelected && (
                <div className="text-sm flex items-center gap-2 mt-2">
                  <div className="p-1.5 bg-blue-50 rounded-md border border-blue-100">
                    <span className="text-blue-600">{fileSelected.name}</span>
                  </div>
                  {/* Process button */}
                  <Button 
                    onClick={handleProcessFile}
                    disabled={isUploading}
                    className="bg-[#4D55CC] hover:bg-[#3c43a0] ml-2"
                  >
                    {isUploading ? 'Processing...' : (
                      <span className="flex items-center">
                        Analyze with AI <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                      </span>
                    )}
                  </Button>
                </div>
              )}
            </div>
          </div>
          
          {/* Try with demo data */}
          <div className="flex flex-col items-center justify-center py-8 border-2 border-dashed border-gray-200 rounded-lg bg-gradient-to-r from-[#4D55CC]/5 to-[#3E7B27]/5">
            <Sparkles className="h-12 w-12 text-[#3E7B27] mb-4" />
            <h3 className="text-lg font-medium mb-2">Try Demo Data</h3>
            <p className="text-sm text-gray-500 mb-4 text-center max-w-md">
              Try sleep analytics with Aftab's (Project H founder) anonymized sleep data
            </p>
            
            <Button 
              onClick={handleLoadDemoData}
              disabled={isLoadingDemo}
              className="bg-[#3E7B27] hover:bg-[#32691f]"
            >
              {isLoadingDemo ? 'Loading...' : (
                <span className="flex items-center">
                  Explore Demo Data <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                </span>
              )}
            </Button>
          </div>
        </div>
        
        <div className="mt-5">
          <h4 className="text-sm font-medium mb-2">How to export Apple Health data:</h4>
          <ol className="text-xs text-gray-600 list-decimal pl-4 space-y-1">
            <li>Open the Health app on your iPhone</li>
            <li>Tap on your profile picture in the top right</li>
            <li>Scroll down and tap on "Export All Health Data"</li>
            <li>After export is complete, extract the CSV file from the zip</li>
            <li>Upload the sleep data CSV file here</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
};

export default FileUploader;