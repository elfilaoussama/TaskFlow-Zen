
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
        updateOnboardingStatus();
    }
    
    if (!showOnboarding) {
        return null;
    }

    return (
        <Dialog open={showOnboarding} onOpenChange={(open) => {
             if (!open) {
                // Allow closing via Esc or overlay click, but don't mark as complete
                // The context already controls the `showOnboarding` prop based on DB state.
             }
        }}>
            <DialogContent className="sm:max-w-[650px] p-0 overflow-hidden" onPointerDownOutside={(e) => {
                // Allow closing by clicking outside
            }}>
                <Carousel setApi={setApi} className="w-full">
                    <CarouselContent>
                        {onboardingSteps.map((step, index) => (
                            <CarouselItem key={index}>
                                <div className="flex flex-col">
                                    <div className="relative w-full aspect-video rounded-t-lg overflow-hidden">
                                        <Image 
                                            src={step.image} 
                                            alt={step.title} 
                                            fill
                                            className="object-cover"
                                            data-ai-hint={step.hint}
                                        />
                                    </div>
                                    <div className="flex flex-col items-center justify-center space-y-2 text-center p-6">
                                        <DialogHeader>
                                            <DialogTitle className="text-2xl">{step.title}</DialogTitle>
                                        </DialogHeader>
                                        <p className="text-muted-foreground">{step.description}</p>
                                    </div>
                                </div>
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                    <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2" />
                    <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2" />
                </Carousel>
                <DialogFooter className="flex-row justify-between items-center w-full p-6 bg-muted/50">
                    <div className="flex items-center gap-2">
                        {Array.from({ length: count }).map((_, i) => (
                             <span key={i} className={`block h-2 w-2 rounded-full ${current === i ? 'bg-primary' : 'bg-muted-foreground/50'}`} />
                        ))}
                    </div>
                     <div className="text-sm text-muted-foreground">
                       Step {current + 1} of {count}
                    </div>
                    {current === count - 1 ? (
                         <Button onClick={handleFinish}>Get Started</Button>
                    ) : (
                        // This button is not visible but ensures consistent height in the footer
                        <Button className="invisible">Get Started</Button>
                    )}
                </DialogFooter>
                 <DialogClose asChild>
                    <Button variant="ghost" size="icon" className="absolute top-2 right-2 z-10 h-8 w-8 rounded-full bg-black/30 hover:bg-black/50 text-white">
                        <X className="h-4 w-4" />
                        <span className="sr-only">Close</span>
                    </Button>
                </DialogClose>
            </DialogContent>
        </Dialog>
    );
}
