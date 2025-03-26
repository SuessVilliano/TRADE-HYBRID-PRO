import React, { useState, useEffect } from "react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription
} from "./card";
import { Button } from "./button";
import { Input } from "./input";
import { Label } from "./label";
import { Slider } from "./slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs";
import { PlayerCustomization } from "../game/Player";
import { ContextualTooltip } from "./contextual-tooltip";
import { useGuest } from "@/lib/stores/useGuest";

export function PlayerCustomizer() {
  const [bodyColor, setBodyColor] = useState("#4285F4");
  const [headColor, setHeadColor] = useState("#34A853");
  const [bodyEmissive, setBodyEmissive] = useState("#1a53ff");
  const [headEmissive, setHeadEmissive] = useState("#34A853");
  const [bodyScaleX, setBodyScaleX] = useState(1);
  const [bodyScaleY, setBodyScaleY] = useState(1.5);
  const [bodyScaleZ, setBodyScaleZ] = useState(1);
  const [headScale, setHeadScale] = useState(0.4);
  const [trailColor, setTrailColor] = useState("#93c5fd");
  const [username, setUsername] = useState("Trader");
  const [role, setRole] = useState("Pro Trader");
  
  // Get guest state
  const { guestUsername, isGuest, isLoggedIn } = useGuest();
  
  // Set username from guest state on initial load
  useEffect(() => {
    if (isGuest) {
      setUsername(guestUsername);
    }
  }, [guestUsername, isGuest]);
  
  const applyCustomization = () => {
    // Use the global function we exposed in Player.tsx
    if (typeof window !== "undefined" && (window as any).updatePlayerCustomization) {
      // If we're a guest, force the guest username
      const effectiveUsername = isGuest ? guestUsername : username;
      
      const customization: PlayerCustomization = {
        bodyColor,
        headColor,
        bodyEmissive,
        headEmissive,
        bodyScale: [bodyScaleX, bodyScaleY, bodyScaleZ],
        headScale: [headScale, headScale, headScale],
        trailColor,
        username: effectiveUsername,
        role: isLoggedIn ? role : 'Guest'
      };
      
      (window as any).updatePlayerCustomization(customization);
    } else {
      console.error("updatePlayerCustomization function not available");
    }
  };
  
  const randomizeColors = () => {
    const randomColor = () => {
      return "#" + Math.floor(Math.random()*16777215).toString(16);
    };
    
    setBodyColor(randomColor());
    setHeadColor(randomColor());
    setBodyEmissive(randomColor());
    setHeadEmissive(randomColor());
    
    // Apply immediately
    setTimeout(applyCustomization, 0);
  };
  
  return (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Player Customization</CardTitle>
        <CardDescription>Customize your character appearance</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="colors">
          <TabsList className="w-full mb-4">
            <TabsTrigger value="colors" className="flex-1">Colors</TabsTrigger>
            <TabsTrigger value="shape" className="flex-1">Shape</TabsTrigger>
            <TabsTrigger value="identity" className="flex-1">Identity</TabsTrigger>
          </TabsList>
          
          <TabsContent value="colors" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="bodyColor">Body Color</Label>
              <div className="flex gap-2">
                <Input 
                  id="bodyColor" 
                  type="color" 
                  value={bodyColor} 
                  onChange={(e) => setBodyColor(e.target.value)} 
                  className="w-12 h-10 p-1" 
                />
                <Input 
                  type="text" 
                  value={bodyColor} 
                  onChange={(e) => setBodyColor(e.target.value)} 
                  className="flex-1" 
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="headColor">Head Color</Label>
              <div className="flex gap-2">
                <Input 
                  id="headColor" 
                  type="color" 
                  value={headColor} 
                  onChange={(e) => setHeadColor(e.target.value)} 
                  className="w-12 h-10 p-1" 
                />
                <Input 
                  type="text" 
                  value={headColor} 
                  onChange={(e) => setHeadColor(e.target.value)} 
                  className="flex-1" 
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="bodyEmissive">Body Glow</Label>
              <div className="flex gap-2">
                <Input 
                  id="bodyEmissive" 
                  type="color" 
                  value={bodyEmissive} 
                  onChange={(e) => setBodyEmissive(e.target.value)} 
                  className="w-12 h-10 p-1" 
                />
                <Input 
                  type="text" 
                  value={bodyEmissive} 
                  onChange={(e) => setBodyEmissive(e.target.value)} 
                  className="flex-1" 
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="headEmissive">Head Glow</Label>
              <div className="flex gap-2">
                <Input 
                  id="headEmissive" 
                  type="color" 
                  value={headEmissive} 
                  onChange={(e) => setHeadEmissive(e.target.value)} 
                  className="w-12 h-10 p-1" 
                />
                <Input 
                  type="text" 
                  value={headEmissive} 
                  onChange={(e) => setHeadEmissive(e.target.value)} 
                  className="flex-1" 
                />
              </div>
            </div>
            
            <Button onClick={randomizeColors} variant="outline" className="w-full">
              Randomize Colors
            </Button>
          </TabsContent>
          
          <TabsContent value="shape" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="bodyScaleX">Body Width</Label>
              <Slider
                id="bodyScaleX"
                min={0.5}
                max={2}
                step={0.1}
                value={[bodyScaleX]}
                onValueChange={(value) => setBodyScaleX(value[0])}
              />
              <div className="text-right text-sm text-muted-foreground">
                {bodyScaleX.toFixed(1)}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="bodyScaleY">Body Height</Label>
              <Slider
                id="bodyScaleY"
                min={1}
                max={3}
                step={0.1}
                value={[bodyScaleY]}
                onValueChange={(value) => setBodyScaleY(value[0])}
              />
              <div className="text-right text-sm text-muted-foreground">
                {bodyScaleY.toFixed(1)}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="bodyScaleZ">Body Depth</Label>
              <Slider
                id="bodyScaleZ"
                min={0.5}
                max={2}
                step={0.1}
                value={[bodyScaleZ]}
                onValueChange={(value) => setBodyScaleZ(value[0])}
              />
              <div className="text-right text-sm text-muted-foreground">
                {bodyScaleZ.toFixed(1)}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="headScale">Head Size</Label>
              <Slider
                id="headScale"
                min={0.2}
                max={0.8}
                step={0.05}
                value={[headScale]}
                onValueChange={(value) => setHeadScale(value[0])}
              />
              <div className="text-right text-sm text-muted-foreground">
                {headScale.toFixed(2)}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="identity" className="space-y-4">
            {isGuest ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="guestUsername">Guest Username</Label>
                  <Input 
                    id="guestUsername" 
                    value={guestUsername}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">
                    You're currently using a guest account with limited access. 
                    Connect a wallet to unlock full features.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label>Account Status</Label>
                  <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-muted">
                    <div className="h-2 w-2 rounded-full bg-amber-500"></div>
                    <span>Guest Mode</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    As a guest, you can only access the main trading space.
                  </p>
                </div>
                
                <div className="space-y-2 pt-2">
                  <Button className="w-full" variant="default">
                    Connect Wallet
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input 
                    id="username" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="role">Display Role</Label>
                  <Input 
                    id="role" 
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Account Status</Label>
                  <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-muted">
                    <div className="h-2 w-2 rounded-full bg-green-500"></div>
                    <span>Connected</span>
                  </div>
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>
        
        <Button onClick={applyCustomization} className="w-full mt-4">
          Apply Changes
        </Button>
      </CardContent>
    </Card>
  );
}