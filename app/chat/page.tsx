"use client"

import { useState, useCallback, useEffect } from "react";
import ChatInterface from "../components/ChatInterface";
import MerchantSelector from "../components/MerchantSelector";
import LanguageSelector from "../components/LanguageSelector";
import DataWindow from "../components/DataWindow";
import MenuItemWindow from "../components/MenuItemWindow";

interface Window {
  id: string;
  type: 'chart' | 'graph' | 'stats' | 'menu-item';
  title: string;
  data?: any;
}

declare global {
  interface Window {
    addDataWindowFromGemini?: (type: 'chart' | 'graph' | 'stats', title?: string, id?: string) => void;
    addMenuItemWindowFromGemini?: (itemName: string, cuisineTag: string, description?: string, imageData?: string, imageUrl?: string, id?: string) => void;
  }
}

export default function ChatPage() {
  const [merchantId, setMerchantId] = useState("0c2d7");
  const [dataWindows, setDataWindows] = useState<Window[]>([]);

  const addDataWindow = useCallback((type: 'chart' | 'graph' | 'stats', customTitle?: string, providedId?: string, windowData?: any) => {
    if (dataWindows.length >= 5 || !providedId) return;
    
    const newId = providedId;
    const defaultTitle = type === 'chart' ? 'Sales Analysis' : 
                  type === 'graph' ? 'Performance Trends' : 'Key Statistics';
    const title = customTitle || defaultTitle;
    
    setDataWindows(prevWindows => [...prevWindows, { id: newId, type, title, data: windowData }]);
    
    return newId;
  }, [dataWindows]);

  const addMenuItemWindow = useCallback((itemName: string, cuisineTag: string, description?: string, imageData?: string, imageUrl?: string, providedId?: string) => {
    if (dataWindows.length >= 5) return;
    
    const newId = providedId || `menu-item-${Date.now()}`;
    const title = "Add New Menu Item";
    
    setDataWindows(prevWindows => [
      ...prevWindows,
      { 
        id: newId, 
        type: 'menu-item', 
        title, 
        data: {
          itemName,
          cuisineTag,
          description,
          imageData,
          imageUrl
        }
      }
    ]);
    
    return newId;
  }, [dataWindows]);

  const removeDataWindow = (windowId: string) => {
    setDataWindows(dataWindows.filter(window => window.id !== windowId));
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.addDataWindowFromGemini = (type, title, id) => addDataWindow(type, title, id);
      window.addMenuItemWindowFromGemini = (itemName, cuisineTag, description, imageData, imageUrl, id) => 
        addMenuItemWindow(itemName, cuisineTag, description, imageData, imageUrl, id);
    }
    
    return () => {
      if (typeof window !== 'undefined') {
        delete window.addDataWindowFromGemini;
        delete window.addMenuItemWindowFromGemini;
      }
    };
  }, [addDataWindow, addMenuItemWindow]);

  const getGridLayout = () => {
    const totalWindows = dataWindows.length + 1;

    switch (totalWindows) {
      case 1:
        return {
          gridClass: "grid-cols-1",
          chatArea: "",
          dataAreas: []
        };
      case 2:
        return {
          gridClass: "grid-cols-1 md:grid-cols-2",
          chatArea: "md:col-span-1 md:row-span-1",
          dataAreas: ["md:col-span-1 md:row-span-1"]
        };
      case 3:
        return {
          gridClass: "grid-cols-1 md:grid-cols-3",
          chatArea: "md:col-span-1 md:col-start-2 md:row-start-1",
          dataAreas: [
            "md:col-span-1 md:col-start-1 md:row-start-1",
            "md:col-span-1 md:col-start-3 md:row-start-1"
          ]
        };
      case 4:
        return {
          gridClass: "grid-cols-1 md:grid-cols-3 md:grid-rows-2",
          chatArea: "md:col-span-1 md:col-start-2 md:row-span-2",
          dataAreas: [
            "md:col-span-1 md:col-start-1 md:row-start-1", 
            "md:col-span-1 md:col-start-3 md:row-start-1",
            "md:col-span-1 md:col-start-1 md:row-start-2"
          ]
        };
      case 5:
        return {
          gridClass: "grid-cols-1 md:grid-cols-3 md:grid-rows-2",
          chatArea: "md:col-span-1 md:col-start-2 md:row-span-2",
          dataAreas: [
            "md:col-span-1 md:col-start-1 md:row-start-1", 
            "md:col-span-1 md:col-start-3 md:row-start-1",
            "md:col-span-1 md:col-start-1 md:row-start-2",
            "md:col-span-1 md:col-start-3 md:row-start-2"
          ]
        };
      case 6:
        return {
          gridClass: "grid-cols-1 md:grid-cols-3 md:grid-rows-3",
          chatArea: "md:col-span-1 md:col-start-2 md:row-span-2",
          dataAreas: [
            "md:col-span-1 md:col-start-1 md:row-start-1", 
            "md:col-span-1 md:col-start-3 md:row-start-1",
            "md:col-span-1 md:col-start-1 md:row-start-2",
            "md:col-span-1 md:col-start-3 md:row-start-2",
            "md:col-span-3 md:col-start-1 md:row-start-3"
          ]
        };
      default:
        return {
          gridClass: "grid-cols-1 md:grid-cols-3 md:grid-rows-2",
          chatArea: "md:col-span-1 md:col-start-2 md:row-span-2",
          dataAreas: []
        };
    }
  };

  const { gridClass, chatArea, dataAreas } = getGridLayout();

  return (
    <div className="min-h-screen flex flex-col items-center p-4">
      <div className="w-full max-w-6xl flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold"
          style={{ fontFamily: "Orbitron, sans-serif", fontSize:"1.2rem"}}>
          Team 404 Brain Not Found</h1>
        <div className="flex items-center gap-4">
          <LanguageSelector />
          <MerchantSelector 
            currentMerchantId={merchantId}
            onMerchantChange={setMerchantId}
          />
        </div>
      </div>

      <div className={`grid ${gridClass} gap-4 w-full max-w-6xl h-[calc(100vh-120px)]`}>
        <div className={`border border-white rounded-2xl overflow-hidden h-full shadow-xl ${chatArea}`}>
          <div className="p-2 border-white border-secondary flex items-center" style={{ backgroundColor: "var(--light)"}}>
            <span className="font-medium" style={{paddingLeft:"10px"}}>Chat Assistant</span>
          </div>
          <div className="h-[calc(100%-2.5rem)]">
            <ChatInterface 
              merchantId={merchantId}
              onAddDataWindow={addDataWindow}
              onAddMenuItemWindow={addMenuItemWindow}
            />
          </div>
        </div>

        {dataWindows.map((window, index) => (
          <div 
            key={window.id} 
            className={`border-white rounded-2xl overflow-hidden shadow-xl ${dataAreas[index] || ""}`}
          >
            <div 
              className="p-2 border-b border-white flex justify-between items-center"
              style={{ backgroundColor: "var(--light)", color: "var(--foreground)" }}
            >
              <span className="font-medium">{window.title}</span>
              <button 
                onClick={() => removeDataWindow(window.id)} 
                className="text-danger hover:text-red-700 cursor-pointer"
                title="Remove Window"
              >
                ✕
              </button>
            </div>
            <div 
              className="h-[calc(100%-2.5rem)]"
              style={{ backgroundColor: "var(--light)", color: "var(--foreground)" }}
            >
              {window.type === 'menu-item' ? (
                <MenuItemWindow 
                  itemName={window.data?.itemName || ""}
                  cuisineTag={window.data?.cuisineTag || ""}
                  description={window.data?.description}
                  imageData={window.data?.imageData}
                  imageUrl={window.data?.imageUrl}
                />
              ) : (
                <DataWindow 
                  type={window.type} 
                  merchantId={merchantId} 
                  data={window.data}
                  title={window.title}
                />
              )}
            </div> 
          </div>
        ))}
      </div>
    </div>
  );
}
