"use client";

import { useStoreSettings } from "@/contexts/store-settings-context";
import { Loader2, Plus, Trash2, HelpCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export default function FaqPageSettings() {
  const { isUpdating, faqPageSettings, setFaqPageSettings } = useStoreSettings();

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFaqPageSettings((prev) => ({ ...prev, title: e.target.value }));
  };

  const handleSubtitleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFaqPageSettings((prev) => ({ ...prev, subtitle: e.target.value }));
  };

  const handleAddFaq = () => {
    setFaqPageSettings((prev) => ({
      ...prev,
      faqs: [...prev.faqs, { question: "", answer: "" }],
    }));
  };

  const handleRemoveFaq = (index: number) => {
    setFaqPageSettings((prev) => ({
      ...prev,
      faqs: prev.faqs.filter((_, i) => i !== index),
    }));
  };

  const handleFaqChange = (index: number, field: "question" | "answer", value: string) => {
    setFaqPageSettings((prev) => {
      const newFaqs = [...prev.faqs];
      newFaqs[index] = { ...newFaqs[index], [field]: value };
      return { ...prev, faqs: newFaqs };
    });
  };

  return (
    <div className="py-8 px-4">
      {isUpdating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="flex items-center gap-3 rounded-lg bg-background px-6 py-4 shadow-lg border border-border">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <span className="text-sm font-medium">Updating settings...</span>
          </div>
        </div>
      )}

      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-primary/10 rounded-xl">
          <HelpCircle className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">FAQ Page</h1>
          <p className="text-muted-foreground mt-1">
            Manage the titles and frequently asked questions displayed on the storefront FAQ page.
          </p>
        </div>
      </div>

      <div className="grid gap-8">
        {/* Page Header configuration */}
        <Card className="border-none shadow-none bg-accent/50 dark:bg-accent">
          <CardHeader>
            <CardTitle>Page Hero Section</CardTitle>
            <CardDescription>Configure the main title and subtitle of the FAQ page.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Title</label>
              <Input
                placeholder="Frequently Inquired Queries"
                value={faqPageSettings?.title || ""}
                onChange={handleTitleChange}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Subtitle</label>
              <Textarea
                placeholder="Find answers to common questions about our services."
                value={faqPageSettings?.subtitle || ""}
                onChange={handleSubtitleChange}
                className="resize-none"
              />
            </div>
          </CardContent>
        </Card>

        {/* FAQs configuration */}
        <Card className="border-none shadow-none bg-accent/50 dark:bg-accent">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle>Questions & Answers</CardTitle>
              <CardDescription className="mt-1">Add or edit the FAQ items shown on the page.</CardDescription>
            </div>
            <Button onClick={handleAddFaq} size="sm" variant="outline" className="gap-2">
              <Plus className="h-4 w-4" />
              Add Question
            </Button>
          </CardHeader>
          <CardContent className="space-y-6 mt-4">
            {faqPageSettings?.faqs?.length === 0 && (
              <div className="text-center p-8 border-2 border-dashed rounded-lg border-border">
                <p className="text-muted-foreground">No questions added yet. Click &quot;Add Question&quot; to get started.</p>
              </div>
            )}
            {faqPageSettings?.faqs?.map((faq, index) => (
              <div key={index} className="relative p-5 border rounded-lg bg-background shadow-sm">
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-2 text-muted-foreground hover:text-destructive transition-colors h-8 w-8"
                  onClick={() => handleRemoveFaq(index)}
                  title="Remove question"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                <div className="space-y-4 pr-6">
                  <div>
                    <label className="text-sm font-medium mb-1.5 block text-foreground">Question</label>
                    <Input
                      placeholder="e.g., What is your return policy?"
                      value={faq.question}
                      onChange={(e) => handleFaqChange(index, "question", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block text-foreground">Answer</label>
                    <Textarea
                      placeholder="Enter the answer here..."
                      value={faq.answer}
                      onChange={(e) => handleFaqChange(index, "answer", e.target.value)}
                      className="min-h-[100px] resize-y"
                    />
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
