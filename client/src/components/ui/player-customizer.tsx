import React, { useState } from "react";
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

export function PlayerCustomizer() {
  const [bodyColor, setBodyColor] = useState("#4285F4");
  const [headColor, setHeadColor] = useState("#34A853");
  const [bodyEmissive, setBodyEmissive] = useState("#1a53ff");
  const [headEmissive, setHeadEmissive] = useState("#34A853");
  const [bodyScaleX, setBodyScaleX] = useState(1);
  const [bodyScaleY, setBodyScaleY] = useState(1.5);
  const [bodyScaleZ, setBodyScaleZ] = useState(1);
  const [headScale, setHeadScale] = useState(0.4);
  
  const applyCustomization = () => {
    // Use the global function we exposed in Player.tsx
    if (typeof window !== "undefined" && (window as any).updatePlayerCustomization) {
      const customization: PlayerCustomization = {
        bodyColor,
        headColor,
        bodyEmissive,
        headEmissive,
        bodyScale: [bodyScaleX, bodyScaleY, bodyScaleZ],
        headScale: [headScale, headScale, headScale]
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
        </Tabs>
        
        <Button onClick={applyCustomization} className="w-full mt-4">
          Apply Changes
        </Button>
      </CardContent>
    </Card>
  );
}