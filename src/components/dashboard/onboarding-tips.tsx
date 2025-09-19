'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { generateUserOnboardingTips } from '@/ai/flows/generate-user-onboarding-tips';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Lightbulb, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AnimatePresence, motion } from 'framer-motion';

export function OnboardingTips() {
  const { user } = useAuth();
  const [tips, setTips] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const fetchTips = async () => {
      if (user?.role) {
        try {
          const response = await generateUserOnboardingTips({ role: user.role });
          setTips(response.tips);
        } catch (error) {
          console.error("Failed to fetch onboarding tips:", error);
          setTips(["Could not load tips at this moment. Please check your connection or try again later."]);
        } finally {
          setLoading(false);
        }
      }
    };
    
    // Check if tips were already fetched and dismissed from session storage
    const dismissed = sessionStorage.getItem('onboarding-tips-dismissed');
    if(dismissed === 'true') {
        setIsVisible(false);
        setLoading(false);
    } else {
        fetchTips();
    }
    
  }, [user?.role]);

  const handleDismiss = () => {
    setIsVisible(false);
    sessionStorage.setItem('onboarding-tips-dismissed', 'true');
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, height: 0, marginBottom: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="bg-primary/10 border-primary/20 relative">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/20 rounded-full">
                    <Lightbulb className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="font-headline text-lg">Quick Start Guide</CardTitle>
                  <CardDescription>
                    Here are a few tips to get you started as a {user?.role}.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Generating personalized tips for you...</span>
                </div>
              ) : (
                <ul className="space-y-2 list-disc pl-5 text-sm">
                  {tips.map((tip, index) => (
                    <li key={index}>{tip}</li>
                  ))}
                </ul>
              )}
            </CardContent>
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 h-7 w-7"
              onClick={handleDismiss}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Dismiss</span>
            </Button>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
