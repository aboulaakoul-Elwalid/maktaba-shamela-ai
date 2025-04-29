import React from "react";
import { cn } from "@/lib/utils";
import { ExternalLink, Info } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ReferenceViewProps {
  references: string[];
  className?: string;
}

export function ReferenceView({ references, className }: ReferenceViewProps) {
  if (!references.length) return null;

  return (
    <div className={cn("mt-2 rounded-lg", className)}>
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="references" className="border-none">
          <AccordionTrigger className="py-2 px-3 text-xs bg-accent/50 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground hover:no-underline">
            <div className="flex items-center">
              <Info className="h-3.5 w-3.5 mr-2" />
              <span>
                View {references.length} source
                {references.length > 1 ? "s" : ""}
              </span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-3 px-0">
            <div className="bg-accent/30 rounded-lg p-3 border border-border">
              <h4 className="text-xs font-medium mb-2 text-muted-foreground">
                References:
              </h4>
              <ul className="space-y-3">
                {references.map((reference, index) => (
                  <li key={index} className="text-sm flex">
                    <ExternalLink className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="text-xs">{reference}</span>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="link"
                              size="sm"
                              className="h-auto p-0 text-xs text-primary"
                            >
                              <ExternalLink className="h-3 w-3 mr-1" />
                              Visit source
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-xs">Opens in a new window</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
