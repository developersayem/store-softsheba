"use client";

import { Plus, Trash2, Columns } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useStoreSettings } from "@/contexts/store-settings-context";
import { FooterItem } from "@/types/store.settings.type";


export default function FooterSectionsSettings() {
  const { sections, setSections } =
    useStoreSettings();

  const handleTitleChange = (sectionIndex: number, newTitle: string) => {
    const newSections = [...sections];
    newSections[sectionIndex].title = newTitle;
    setSections(newSections);
  };

  const handleItemChange = (
    sectionIndex: number,
    itemIndex: number,
    field: keyof FooterItem,
    value: string
  ) => {
    const newSections = [...sections];
    newSections[sectionIndex].items[itemIndex] = {
      ...newSections[sectionIndex].items[itemIndex],
      [field]: value,
    };
    setSections(newSections);
  };

  const addItem = (sectionIndex: number) => {
    const newSections = [...sections];
    newSections[sectionIndex].items.push({  label: "", href: "" });
    setSections(newSections);
  };

  const removeItem = (sectionIndex: number, itemIndex: number) => {
    const newSections = [...sections];
    newSections[sectionIndex].items = newSections[sectionIndex].items.filter(
      (_, i) => i !== itemIndex
    );
    setSections(newSections);
  };

  return (
    <div className="space-y-6  mt-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Columns size={24} className="text-primary" /> Footer Links
          </h2>
          <p className="text-muted-foreground">
            Manage the two customizable link columns in your website footer.
          </p>
        </div>
      </div>

      <Separator />

      {/*  2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 ">
        {sections?.map((section, sIndex) => (
          <Card
            key={sIndex}
            className="flex flex-col h-full border-t-4 border-t-primary/20 dark:bg-accent"
          >
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between mb-2">
                <Badge variant="secondary">Column {sIndex + 1}</Badge>
                <span className="text-xs text-muted-foreground">
                  {section.items.length} links
                </span>
              </div>

              {/* Section Title Input */}
              <div className="space-y-2">
                <Label>Column Title</Label>
                <Input
                  value={section.title}
                  onChange={(e) => handleTitleChange(sIndex, e.target.value)}
                  className="font-semibold text-lg"
                  placeholder="e.g. Customer Service"
                />
              </div>
            </CardHeader>

            <CardContent className="flex-1 space-y-4">
              <div className="space-y-3">
                {/* Header Labels for the List */}
                <div className="grid grid-cols-12 gap-2 px-1 text-xs font-medium text-muted-foreground uppercase">
                  <div className="col-span-5">Label</div>
                  <div className="col-span-6">URL / Path</div>
                  <div className="col-span-1"></div>
                </div>

                {/* Dynamic Items */}
                {section.items.map((item, iIndex) => (
                  <div
                    key={iIndex}
                    className="group grid grid-cols-12 gap-2 items-center"
                  >
                    {/* Label Input */}
                    <div className="col-span-5 relative">
                      <Input
                        value={item.label}
                        onChange={(e) =>
                          handleItemChange(
                            sIndex,
                            iIndex,
                            "label",
                            e.target.value
                          )
                        }
                        placeholder="Link Name"
                        className="h-9 text-sm"
                      />
                    </div>

                    {/* Href Input */}
                    <div className="col-span-6 relative">
                      <Input
                        value={item.href}
                        onChange={(e) =>
                          handleItemChange(
                            sIndex,
                            iIndex,
                            "href",
                            e.target.value
                          )
                        }
                        placeholder="path end point"
                        className="h-9 text-sm font-mono text-accent-foreground"
                      />
                    </div>

                    {/* Delete Action */}
                    <div className="col-span-1 flex justify-end">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-50 group-hover:opacity-100 transition-all"
                        onClick={() => removeItem(sIndex, iIndex)}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </div>
                ))}

                {/* Empty State */}
                {section.items.length === 0 && (
                  <div className="text-center py-6 border-2 border-dashed rounded-lg bg-accent/30 text-muted-foreground text-sm">
                    No links in this column yet.
                  </div>
                )}
              </div>

              <Button
                variant="outline"
                size="sm"
                className="w-full border-dashed gap-2 mt-2"
                onClick={() => addItem(sIndex)}
              >
                <Plus size={14} /> Add Link
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
