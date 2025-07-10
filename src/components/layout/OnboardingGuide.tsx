
"use client";

import React from 'react';
import Image from 'next/image';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from '@/components/ui/carousel';
import { useAuth } from '@/contexts/AuthContext';
import { X } from 'lucide-react';

const onboardingSteps = [
    {
        image: "https://placehold.co/600x400.png",
        hint: "welcome handshake",
        title: "Welcome to Tassko!",
        description: "Your new workspace for masterful task management. Let's take a quick tour to get you started."
    },
    {
        image: "https://placehold.co/600x400.png",
        hint: "task list",
        title: "The General Task Pool",
        description: "This is your main inbox. Add any task that comes to mind here. They're all kept in one place, organized by category, until you're ready to plan your day."
    },
    {
        image: "https://placehold.co/600x400.png",
        hint: "kanban board",
        title: "Your Daily Kanban",
        description: "When you're ready to work, move tasks from the General Pool to your Daily Kanban. This is your focused plan for today, organized into Morning, Midday, and Evening."
    },
    {
        image: "https://placehold.co/600x400.png",
        hint: "AI prioritization",
        title: "Smart Prioritization",
        description: "Each task has a priority score based on its urgency, importance, and deadline. Use the AI helper on the daily board to automatically move tasks to the best swimlane!"
    },
    {
        image: "https://placehold.co/600x400.png",
        hint: "rocket launch",
        title: "You're All Set!",
        description: "That's it! You're ready to start organizing your life. Click the button below to dive in and create your first task."
    }
]

export function OnboardingGuide() {
    const { showOnboarding, updateOnboardingStatus } = useAuth();
    const [api, setApi] = React.useState<CarouselApi>();
    const [current, setCurrent] = React.useState(0);
    const [count, setCount] = React.useState(0);

    React.useEffect(() => {
        if (!api) return;
        setCount(api.scrollSnapList().length);
        setCurrent(api.selectedScrollSnap());
        api.on("select", () => {
            setCurrent(api.selectedScrollSnap());
        });
    }, [api]);

    const handleFinish = () => {
        // This will set hasCompletedOnboarding to true in Firestore
        // and update the local state to close the dialog.
        updateOnboardingStatus();
    }
    
    // We only render the dialog if showOnboarding is true
    if (!showOnboarding) {
        return null;
    }

    return (
        <Dialog open={showOnboarding} onOpenChange={(open) => {
             // Closing the dialog via "X" or clicking outside
             // should not mark it as complete. The state is handled
             // by AuthProvider, so we don't need to do anything here.
             // We only prevent marking as complete.
             if (!open) {
                // The context will still control the `showOnboarding` prop,
                // so we don't need `setShowOnboarding(false)`.
                // This handler is just to intercept the close event.
             }
        }}>
            <DialogContent className="sm:max-w-[650px] p-0 overflow-hidden" onPointerDownOutside={(e) => e.preventDefault()}>
                <DialogClose asChild>
                    <Button variant="ghost" size="icon" className="absolute top-2 right-2 z-10 h-8 w-8 rounded-full">
                        <X className="h-4 w-4" />
                        <span className="sr-only">Close</span>
                    </Button>
                </DialogClose>
                <Carousel setApi={setApi} className="w-full">
                    <CarouselContent>
                        {onboardingSteps.map((step, index) => (
                            <CarouselItem key={index}>
                                <div className="p-1 pt-8">
                                    <div className="flex flex-col items-center justify-center space-y-4 text-center p-6">
                                        <div className="relative w-full h-[40vh] max-h-[300px] rounded-lg overflow-hidden">
                                            <Image 
                                                src={step.image} 
                                                alt={step.title} 
                                                fill
                                                className="object-cover"
                                                data-ai-hint={step.hint}
                                            />
                                        </div>
                                        <DialogHeader>
                                            <DialogTitle className="text-2xl">{step.title}</DialogTitle>
                                        </DialogHeader>
                                        <p className="text-muted-foreground">{step.description}</p>
                                    </div>
                                </div>
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                    {/* Make nav buttons easier to tap on mobile by placing them inside */}
                    <div className="absolute bottom-6 left-6">
                       <CarouselPrevious className="static -translate-y-0" />
                    </div>
                     <div className="absolute bottom-6 right-6">
                       <CarouselNext className="static -translate-y-0" />
                    </div>
                </Carousel>
                <DialogFooter className="flex-row justify-between items-center w-full p-6 bg-muted/50">
                    <div className="text-sm text-muted-foreground">
                       Step {current + 1} of {count}
                    </div>
                    {current === count - 1 ? (
                         <Button onClick={handleFinish}>Get Started</Button>
                    ) : (
                        <Button variant="ghost" className="invisible">Next</Button> // Placeholder to keep alignment
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
