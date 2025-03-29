                    </div>
                    
                    <Button variant="outline">
                      Export My Data
                    </Button>
                  </div>
                </div>
                </div>
              </div>
            </TabsContent>
          </div>
          
          <div className="p-4 border-t flex justify-between">
            <Button variant="outline" onClick={resetSettings}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset to Default
            </Button>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={onClose}>Cancel</Button>
              <Button onClick={saveSettings}>
                <Save className="h-4 w-4 mr-2" />
                Save Settings
              </Button>
            </div>
          </div>
        </Tabs>
      </div>
    </PopupContainer>
  );
}