
"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogClose,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { useAuth } from "@/contexts/AuthContext";
import { X, ChevronLeft, ChevronRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const onboardingSteps = [
  {
    image: "https://placehold.co/800x800",
    hint: "welcome handshake",
    title: "Welcome to Tassko!",
    description:
      "Your new workspace for masterful task management. Let's take a quick tour to get you started.",
  },
  {
    image: "https://placehold.co/800x800",
    hint: "task list",
    title: "The General Task Pool",
    description:
      "This is your main inbox. Add any task that comes to mind here. They're all kept in one place, organized by category, until you're ready to plan your day.",
  },
  {
    image: "https://placehold.co/800x800",
    hint: "kanban board",
    title: "Your Daily Kanban",
    description:
      "When you're ready to work, move tasks from the General Pool to your Daily Kanban. This is your focused plan for today, organized into Morning, Midday, and Evening.",
  },
  {
    image: "https://placehold.co/800x800",
    hint: "AI prioritization",
    title: "Smart Prioritization",
    description:
      "Each task has a priority score based on its urgency, importance, and deadline. Use the AI helper on the daily board to automatically move tasks to the best swimlane!",
  },
  {
    image: "https://placehold.co/800x800",
    hint: "rocket launch",
    title: "You're All Set!",
    description:
      "That's it! You're ready to start organizing your life. Click the button below to dive in and create your first task.",
  },
];

export function OnboardingGuide() {
  const { showOnboarding, updateOnboardingStatus } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [api, setApi] = useState<CarouselApi>();
  const [currentStep, setCurrentStep] = useState(0);
  const [viewedSteps, setViewedSteps] = useState(new Set([0]));
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const minSwipeDistance = 50;

  useEffect(() => {
    if (showOnboarding) {
      setIsOpen(true);
    }
  }, [showOnboarding]);

  const handleNext = useCallback(() => {
    api?.scrollNext();
  }, [api]);

  const handlePrevious = useCallback(() => {
    api?.scrollPrev();
  }, [api]);

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && currentStep < onboardingSteps.length - 1) {
      handleNext();
    } else if (isRightSwipe && currentStep > 0) {
      handlePrevious();
    }
  };

  useEffect(() => {
    if (!api) return;

    const onSelect = (api: CarouselApi) => {
      const selected = api.selectedScrollSnap();
      setCurrentStep(selected);
      setViewedSteps((prev) => new Set([...prev, selected]));
    };

    onSelect(api);
    api.on("select", onSelect);

    return () => {
      api.off("select", onSelect);
    };
  }, [api]);

  const handleFinish = () => {
    updateOnboardingStatus();
    setIsOpen(false);
  };

  const allStepsViewed = viewedSteps.size === onboardingSteps.length;
  const isLastStep = currentStep === onboardingSteps.length - 1;

  if (!isOpen) {
    return null;
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={setIsOpen}
    >
      <DialogContent
        className="w-full max-w-4xl max-h-[95vh] sm:max-h-[85vh] p-0 gap-0 overflow-hidden flex flex-col"
      >
        <DialogHeader>
          <DialogTitle className="sr-only">Application Onboarding Guide</DialogTitle>
          <DialogClose
            className="absolute top-2 right-2 z-20 h-8 w-8 rounded-full bg-black/30 hover:bg-black/50 text-white flex items-center justify-center"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </DialogClose>
        </DialogHeader>

        <div
          className="flex-1 flex flex-col lg:flex-row min-h-0"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          {/* Image Section */}
          <div className="relative w-full lg:w-1/2 h-64 sm:h-80 lg:h-auto bg-muted overflow-hidden">
            <Carousel setApi={setApi} className="w-full h-full">
              <CarouselContent>
                {onboardingSteps.map((step, index) => (
                  <CarouselItem key={index}>
                    <div className="relative w-full h-full">
                       <Image
                          src={step.image}
                          alt={step.title}
                          fill
                          className="object-cover"
                          data-ai-hint={step.hint}
                          priority={index === 0}
                        />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
          </div>

          {/* Content Section */}
          <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-8 lg:p-12 overflow-y-auto">
            <div className="text-center w-full">
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
                {onboardingSteps[currentStep].title}
              </h2>
              <p className="text-muted-foreground text-sm sm:text-base leading-relaxed mb-6">
                {onboardingSteps[currentStep].description}
              </p>
            </div>

            <div className="flex justify-center mb-6">
              {onboardingSteps.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    api?.scrollTo(index);
                    setViewedSteps(prev => new Set([...prev, index]));
                  }}
                  className={cn(
                    "w-2 h-2 mx-1.5 rounded-full transition-all duration-300",
                    index === currentStep
                      ? 'bg-primary scale-125'
                      : viewedSteps.has(index)
                      ? 'bg-primary/40 hover:bg-primary/60'
                      : 'bg-muted-foreground/40 hover:bg-muted-foreground/60'
                  )}
                  aria-label={`Go to step ${index + 1}`}
                />
              ))}
            </div>

            <div className="flex items-center justify-between w-full">
              <Button
                onClick={handlePrevious}
                disabled={currentStep === 0}
                variant="ghost"
                className="disabled:opacity-50"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Prev
              </Button>

              <div className="flex-1 text-center">
                 {isLastStep && allStepsViewed ? (
                    <Button onClick={handleFinish} className="shadow-lg transform hover:scale-105">
                      <Check className="w-4 h-4 mr-2" />
                      Get Started
                    </Button>
                  ) : (
                    <span className="text-sm text-muted-foreground">
                        Step {currentStep + 1} of {onboardingSteps.length}
                    </span>
                  )}
              </div>
              
              <Button
                onClick={handleNext}
                disabled={isLastStep}
                variant="ghost"
                className="disabled:opacity-50"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
            
             <div className="lg:hidden mt-6 text-center">
                <p className="text-xs text-muted-foreground">
                    Swipe to navigate
                </p>
            </div>

          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
