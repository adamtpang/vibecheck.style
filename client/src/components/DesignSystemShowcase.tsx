/**
 * Design System Showcase Component
 * Demonstrates the integration of shadcn/ui, Framer Motion, and Coolors palette
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  MotionWrapper,
  MotionButton,
  StaggerList,
  StaggerItem,
} from "@/components/motion/motion-wrapper";
import { colors, colorUtils } from "@/lib/colors";

export function DesignSystemShowcase() {
  const [selectedTheme, setSelectedTheme] = useState("burgundy");

  return (
    <div
      className="min-h-screen p-8"
      style={{ backgroundColor: colors.background }}
    >
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header with Motion */}
        <MotionWrapper variant="fadeIn">
          <div className="text-center space-y-4">
            <h1
              className="text-5xl font-bold"
              style={{ color: colors.navy }}
            >
              Design System Showcase
            </h1>
            <p
              className="text-lg"
              style={{ color: colors.textMuted }}
            >
              shadcn/ui + Framer Motion + Coolors Palette
            </p>

            {/* Color Palette Display */}
            <div className="flex justify-center gap-4 mt-6">
              {Object.entries({
                "Dark Burgundy": colors.darkBurgundy,
                Red: colors.red,
                Cream: colors.cream,
                Navy: colors.navy,
                "Light Blue": colors.lightBlue,
              }).map(([name, color]) => (
                <div key={name} className="text-center">
                  <div
                    className="w-16 h-16 rounded-lg shadow-md"
                    style={{ backgroundColor: color }}
                  />
                  <p className="text-xs mt-2" style={{ color: colors.textLight }}>
                    {name}
                  </p>
                  <p className="text-xs font-mono" style={{ color: colors.textMuted }}>
                    {color}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </MotionWrapper>

        {/* Tabs with shadcn/ui */}
        <MotionWrapper variant="scaleIn" delay={0.2}>
          <Tabs defaultValue="components" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="components">Components</TabsTrigger>
              <TabsTrigger value="animations">Animations</TabsTrigger>
              <TabsTrigger value="forms">Forms</TabsTrigger>
            </TabsList>

            <TabsContent value="components" className="space-y-6 mt-6">
              {/* Cards Grid with Stagger Animation */}
              <StaggerList className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <StaggerItem>
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <Avatar>
                          <AvatarImage src="https://github.com/shadcn.png" />
                          <AvatarFallback>CN</AvatarFallback>
                        </Avatar>
                        <Badge style={{ backgroundColor: colors.primary }}>
                          Featured
                        </Badge>
                      </div>
                      <CardTitle style={{ color: colors.navy }}>
                        User Profile
                      </CardTitle>
                      <CardDescription>
                        A beautiful card with avatar and badge
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p style={{ color: colors.textLight }}>
                        This card demonstrates the integration of multiple
                        shadcn/ui components with our custom color palette.
                      </p>
                    </CardContent>
                    <CardFooter>
                      <Button
                        className="w-full"
                        style={{
                          backgroundColor: colors.primary,
                          color: colors.cream,
                        }}
                      >
                        View Profile
                      </Button>
                    </CardFooter>
                  </Card>
                </StaggerItem>

                <StaggerItem>
                  <Card>
                    <CardHeader>
                      <CardTitle style={{ color: colors.navy }}>
                        Actions Menu
                      </CardTitle>
                      <CardDescription>
                        Dropdown menu with custom styling
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="outline"
                            style={{
                              borderColor: colors.border,
                              color: colors.navy,
                            }}
                          >
                            Open Menu
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuLabel>My Account</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>Profile</DropdownMenuItem>
                          <DropdownMenuItem>Billing</DropdownMenuItem>
                          <DropdownMenuItem>Team</DropdownMenuItem>
                          <DropdownMenuItem>Subscription</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>

                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            style={{
                              backgroundColor: colors.accent,
                              color: colors.cream,
                            }}
                          >
                            Open Dialog
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Are you sure?</DialogTitle>
                            <DialogDescription>
                              This action cannot be undone. This will permanently
                              delete your account and remove your data from our
                              servers.
                            </DialogDescription>
                          </DialogHeader>
                          <DialogFooter>
                            <Button variant="outline">Cancel</Button>
                            <Button
                              style={{
                                backgroundColor: colors.error,
                                color: "white",
                              }}
                            >
                              Confirm
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </CardContent>
                  </Card>
                </StaggerItem>

                <StaggerItem>
                  <Card>
                    <CardHeader>
                      <CardTitle style={{ color: colors.navy }}>
                        Status Badges
                      </CardTitle>
                      <CardDescription>
                        Different badge variants
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex flex-wrap gap-2">
                        <Badge style={{ backgroundColor: colors.primary }}>
                          Primary
                        </Badge>
                        <Badge style={{ backgroundColor: colors.secondary }}>
                          Secondary
                        </Badge>
                        <Badge style={{ backgroundColor: colors.accent }}>
                          Accent
                        </Badge>
                        <Badge style={{ backgroundColor: colors.success }}>
                          Success
                        </Badge>
                        <Badge style={{ backgroundColor: colors.error }}>
                          Error
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </StaggerItem>
              </StaggerList>
            </TabsContent>

            <TabsContent value="animations" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle style={{ color: colors.navy }}>
                    Animation Variants
                  </CardTitle>
                  <CardDescription>
                    Different motion presets available
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <MotionWrapper variant="fadeIn">
                      <Card>
                        <CardContent className="pt-6">
                          <p style={{ color: colors.textLight }}>
                            <strong>fadeIn:</strong> Fades in with slide up
                          </p>
                        </CardContent>
                      </Card>
                    </MotionWrapper>

                    <MotionWrapper variant="scaleIn">
                      <Card>
                        <CardContent className="pt-6">
                          <p style={{ color: colors.textLight }}>
                            <strong>scaleIn:</strong> Scales from 0.9 with spring
                          </p>
                        </CardContent>
                      </Card>
                    </MotionWrapper>

                    <MotionWrapper variant="slideInFromLeft">
                      <Card>
                        <CardContent className="pt-6">
                          <p style={{ color: colors.textLight }}>
                            <strong>slideInFromLeft:</strong> Slides from left
                          </p>
                        </CardContent>
                      </Card>
                    </MotionWrapper>

                    <MotionWrapper variant="slideInFromRight">
                      <Card>
                        <CardContent className="pt-6">
                          <p style={{ color: colors.textLight }}>
                            <strong>slideInFromRight:</strong> Slides from right
                          </p>
                        </CardContent>
                      </Card>
                    </MotionWrapper>
                  </div>

                  <div>
                    <h3
                      className="text-lg font-semibold mb-4"
                      style={{ color: colors.navy }}
                    >
                      Interactive Buttons
                    </h3>
                    <div className="flex gap-4">
                      <MotionButton
                        style={{
                          backgroundColor: colors.primary,
                          color: colors.cream,
                          padding: "0.5rem 1rem",
                          borderRadius: "0.375rem",
                        }}
                      >
                        Hover Me
                      </MotionButton>
                      <MotionButton
                        style={{
                          backgroundColor: colors.accent,
                          color: colors.cream,
                          padding: "0.5rem 1rem",
                          borderRadius: "0.375rem",
                        }}
                      >
                        Click Me
                      </MotionButton>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="forms" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle style={{ color: colors.navy }}>
                    Sample Form
                  </CardTitle>
                  <CardDescription>
                    Form components with custom styling
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" placeholder="Enter your name" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="theme">Theme</Label>
                    <Select value={selectedTheme} onValueChange={setSelectedTheme}>
                      <SelectTrigger id="theme">
                        <SelectValue placeholder="Select a theme" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="burgundy">
                          Burgundy & Navy
                        </SelectItem>
                        <SelectItem value="modern">Modern</SelectItem>
                        <SelectItem value="vintage">Vintage</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full"
                    style={{
                      backgroundColor: colors.primary,
                      color: colors.cream,
                    }}
                  >
                    Submit
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </MotionWrapper>
      </div>
    </div>
  );
}
