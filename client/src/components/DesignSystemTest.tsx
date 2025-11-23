/**
 * Simple Test Component - Verify the design system is working
 * Import this in App.tsx to quickly test the setup
 */

import { MotionWrapper, StaggerList, StaggerItem } from "@/components/motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { colors } from "@/lib/colors";

export function DesignSystemTest() {
  const features = [
    { icon: "✨", title: "shadcn/ui", status: "Working" },
    { icon: "🎭", title: "Framer Motion", status: "Working" },
    { icon: "🎨", title: "Coolors Palette", status: "Working" },
  ];

  return (
    <div
      className="min-h-screen flex items-center justify-center p-8"
      style={{ backgroundColor: colors.background }}
    >
      <MotionWrapper variant="scaleIn">
        <Card className="max-w-2xl w-full">
          <CardHeader className="text-center">
            <CardTitle style={{ color: colors.navy, fontSize: "2rem" }}>
              🎉 Design System Ready!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p
              className="text-center"
              style={{ color: colors.textLight }}
            >
              All components are installed and working correctly
            </p>

            <StaggerList className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {features.map((feature) => (
                <StaggerItem key={feature.title}>
                  <Card>
                    <CardContent className="pt-6 text-center space-y-2">
                      <div className="text-4xl">{feature.icon}</div>
                      <h3
                        className="font-semibold"
                        style={{ color: colors.navy }}
                      >
                        {feature.title}
                      </h3>
                      <Badge
                        style={{
                          backgroundColor: colors.success,
                          color: "white",
                        }}
                      >
                        {feature.status}
                      </Badge>
                    </CardContent>
                  </Card>
                </StaggerItem>
              ))}
            </StaggerList>

            <div className="flex gap-4 justify-center pt-4">
              <Button
                style={{
                  backgroundColor: colors.primary,
                  color: colors.cream,
                }}
              >
                View Docs
              </Button>
              <Button
                variant="outline"
                style={{
                  borderColor: colors.border,
                  color: colors.navy,
                }}
              >
                Examples
              </Button>
            </div>

            <div
              className="text-center text-sm pt-4"
              style={{ color: colors.textMuted }}
            >
              Check QUICK_START.md to get started building!
            </div>
          </CardContent>
        </Card>
      </MotionWrapper>
    </div>
  );
}
