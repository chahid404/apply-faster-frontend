import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";
import {
  Copy,
  FileDown,
  FileText,
  HelpCircle,
  Loader2,
  RefreshCw,
  Send,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { cn } from "./lib/utils";

export default function ModernJobApplicationForm() {
  const [jobDescription, setJobDescription] = useState("");
  const [responseType, setResponseType] = useState("email");
  const [coverLetterFormat, setCoverLetterFormat] = useState("text");
  const [resume, setResume] = useState<string | null>(null);
  const [useAdvancedAI, setUseAdvancedAI] = useState(false);
  const [userResume, setUserResume] = useState({});
  const [question, setQuestion] = useState("");
  const [apiResponse, setApiResponse] = useState("");
  const [displayedResponse, setDisplayedResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzingResume, setIsAnalyzingResume] = useState(false);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [companyAddress, setCompanyAddress] = useState("");
  const [recruiterName, setRecruiterName] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    if (apiResponse) {
      let i = 0;
      const intervalId = setInterval(() => {
        setDisplayedResponse(apiResponse.slice(0, i));
        i++;
        if (i > apiResponse.length) {
          clearInterval(intervalId);
        }
      }, 10);
      return () => clearInterval(intervalId);
    }
  }, [apiResponse]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!resume) {
      toast({
        title: "Resume Required",
        description: "Please upload your resume before generating a response.",
        variant: "destructive",
      });
      return;
    }
    if (
      responseType === "cover-letter" &&
      coverLetterFormat === "pdf" &&
      !showPdfModal
    ) {
      setShowPdfModal(true);
      return;
    }
    if (responseType === "cover-letter" && coverLetterFormat === "text") {
      setCompanyAddress("");
      setCompanyName("");
      setRecruiterName("");
    }
    setIsLoading(true);
    setApiResponse("");
    setDisplayedResponse("");
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/chat/job`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            jobDescription,
            responseType,
            question,
            useAdvancedAI,
            coverLetterFormat,
            companyName,
            companyAddress,
            recruiterName,
            userResume,
          }),
        }
      );
      const data = await response.json();
      setApiResponse(data.response);
      toast({
        title: "Response generated",
        description: "Your job application response has been created.",
      });
      toast({
        title: "Best resume",
        description: data?.bestResume,
      });
    } catch (error) {
      console.error("Error:", error);
      setApiResponse("An error occurred while processing your request.");
      toast({
        title: "Error",
        description: "Failed to generate response. Please try again.",
        variant: "destructive",
      });
    }
    setIsLoading(false);
    setShowPdfModal(false);
  };

  const handleClear = () => {
    setJobDescription("");
    setResponseType("email");
    setCoverLetterFormat("text");
    setUseAdvancedAI(false);
    setQuestion("");
    setApiResponse("");
    setDisplayedResponse("");
    setCompanyName("");
    setCompanyAddress("");
    setRecruiterName("");
    setResume(null);
    localStorage.setItem("resume", "");
    toast({
      title: "Cleared",
      description: "All fields have been reset.",
    });
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(apiResponse);
    toast({
      title: "Copied",
      description: "Response copied to clipboard.",
    });
  };

  const handleRetry = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    handleSubmit(new Event("submit") as any);
  };

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type === "application/pdf") {
        try {
          const formData = new FormData();
          formData.append("pdf", file);
          setIsAnalyzingResume(true);
          setResume(null);
          const response = await axios.post<{ extractedText: string }>(
            `${import.meta.env.VITE_API_URL}/api/analyze/resume`,
            formData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            }
          );

          const result = response.data.extractedText;
          localStorage.setItem("resume", JSON.stringify(result, null, 2));
          setUserResume(JSON.stringify(result, null, 2));
          setResume(file.name);
          toast({
            title: "Resume uploaded",
            description: "Your resume has been successfully uploaded.",
          });
        } catch (error) {
          console.log("error uploading resume", error);
          toast({
            title: "Failed to analyze resume",
            description: "Please upload a new resume.",
            variant: "destructive",
          });
        } finally {
          setIsAnalyzingResume(false);
          e.target.value = "";
        }
      } else {
        toast({
          title: "Invalid file type",
          description: "Please upload a PDF file.",
          variant: "destructive",
        });
      }
    }
  };
  const handleRemoveResume = () => {
    setResume(null);
    toast({
      title: "Resume removed",
      description: "Your resume has been removed.",
    });
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-primary to-primary/60 text-transparent bg-clip-text"
      >
        Job Application Assistant
      </motion.h1>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="overflow-hidden border-2 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5">
            <CardTitle>Create Your Application</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label htmlFor="resume" className="text-lg font-semibold">
                    Resume
                  </Label>
                  <div className="flex items-center gap-2">
                    {resume && (
                      <div className="flex items-center gap-2 bg-secondary rounded-lg px-3 py-1">
                        <FileText className="h-4 w-4" />
                        <span className="text-sm">{resume}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={handleRemoveResume}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                    <Label
                      htmlFor={isAnalyzingResume ? undefined : "resume-upload"}
                      className={cn(
                        "cursor-pointer inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring px-3 py-2",
                        isAnalyzingResume
                          ? "bg-blue-500 text-white opacity-50 cursor-not-allowed pointer-events-none"
                          : "bg-primary text-primary-foreground hover:bg-primary/90"
                      )}
                    >
                      {isAnalyzingResume ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Upload className="mr-2 h-4 w-4" />
                      )}
                      {isAnalyzingResume ? "Analyzing..." : "Upload Resume"}
                    </Label>

                    <Input
                      id="resume-upload"
                      type="file"
                      accept=".pdf"
                      className="hidden"
                      disabled={isAnalyzingResume}
                      onChange={handleResumeUpload}
                    />
                  </div>
                </div>

                <Label
                  htmlFor="jobDescription"
                  className="text-lg font-semibold"
                >
                  Job Description
                </Label>
                <Textarea
                  id="jobDescription"
                  placeholder="Enter job description here..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  className="h-40 resize-none transition-all duration-200 focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="space-y-4">
                <Label>Response Type</Label>
                <div className="flex flex-wrap gap-4">
                  <RadioGroup
                    value={responseType}
                    onValueChange={setResponseType}
                    className="flex flex-wrap gap-4"
                  >
                    {["email", "message", "cover-letter", "answer"].map(
                      (type) => (
                        <div
                          key={type}
                          className="flex items-center space-x-2 bg-secondary rounded-md px-4 py-2"
                        >
                          <RadioGroupItem value={type} id={type} />
                          <Label
                            htmlFor={type}
                            className="capitalize cursor-pointer"
                          >
                            {type.replace("-", " ")}
                          </Label>
                        </div>
                      )
                    )}
                  </RadioGroup>
                  <div className="flex items-center space-x-2 px-4 py-2">
                    <Checkbox
                      id="advanced-ai"
                      checked={useAdvancedAI}
                      onCheckedChange={(checked) =>
                        setUseAdvancedAI(checked as boolean)
                      }
                    />
                    <Label htmlFor="advanced-ai" className="cursor-pointer">
                      Use Advanced AI
                    </Label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>
                          Uses a more advanced AI model. Processing may take
                          longer.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>
              </div>
              <AnimatePresence>
                {responseType === "cover-letter" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4 overflow-hidden"
                  >
                    <Label className="text-lg font-semibold">
                      Cover Letter Format
                    </Label>
                    <RadioGroup
                      value={coverLetterFormat}
                      onValueChange={setCoverLetterFormat}
                      className="flex gap-4"
                    >
                      <div className="flex items-center space-x-2 bg-secondary/50 hover:bg-secondary/70 transition-colors rounded-md px-4 py-2">
                        <RadioGroupItem value="text" id="text" />
                        <Label
                          htmlFor="text"
                          className="cursor-pointer flex items-center"
                        >
                          <FileText className="mr-2 h-4 w-4" />
                          Text
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2 bg-secondary/50 hover:bg-secondary/70 transition-colors rounded-md px-4 py-2">
                        <RadioGroupItem value="pdf" id="pdf" />
                        <Label
                          htmlFor="pdf"
                          className="cursor-pointer flex items-center"
                        >
                          <FileDown className="mr-2 h-4 w-4" />
                          PDF
                        </Label>
                      </div>
                    </RadioGroup>
                  </motion.div>
                )}
                {responseType === "answer" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4 overflow-hidden"
                  >
                    <Label htmlFor="question" className="text-lg font-semibold">
                      Question
                    </Label>
                    <Input
                      id="question"
                      placeholder="Enter the question you want to answer..."
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      className="transition-all duration-200 focus:ring-2 focus:ring-primary"
                    />
                  </motion.div>
                )}
              </AnimatePresence>
              <div className="flex space-x-2 justify-end">
                <div>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full sm:w-auto transition-all duration-200 hover:bg-primary/90"
                  >
                    {isLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="mr-2 h-4 w-4" />
                    )}
                    {isLoading ? "Generating..." : "Generate Response"}
                  </Button>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClear}
                  className="w-full sm:w-auto transition-all duration-200 hover:bg-destructive hover:text-destructive-foreground"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Clear
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>

      <AnimatePresence>
        {displayedResponse && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="mt-8"
          >
            <Card className="border-2 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5">
                <CardTitle>Generated Response</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm max-w-none mt-4">
                <div className="whitespace-pre-wrap bg-muted p-4 rounded-md font-mono text-sm">
                  {displayedResponse}
                </div>
              </CardContent>
              <CardFooter className="flex justify-end space-x-2 mt-4">
                <Button
                  onClick={handleCopy}
                  variant="outline"
                  size="sm"
                  className="transition-all duration-200 hover:bg-primary hover:text-primary-foreground"
                >
                  <Copy className="mr-2 h-4 w-4" />
                  Copy
                </Button>
                <Button
                  onClick={handleRetry}
                  variant="outline"
                  size="sm"
                  className="transition-all duration-200 hover:bg-primary hover:text-primary-foreground"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Regenerate
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <Dialog open={showPdfModal} onOpenChange={setShowPdfModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>PDF Cover Letter Details</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name</Label>
              <Input
                id="companyName"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Enter company name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="companyAddress">Company Address</Label>
              <Input
                id="companyAddress"
                value={companyAddress}
                onChange={(e) => setCompanyAddress(e.target.value)}
                placeholder="Enter company address"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="recruiterName">Recruiter Name</Label>
              <Input
                id="recruiterName"
                value={recruiterName}
                onChange={(e) => setRecruiterName(e.target.value)}
                placeholder="Enter recruiter name"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="submit"
              onClick={(e) => {
                setShowPdfModal(false);
                handleSubmit(e);
              }}
            >
              Generate PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
