"use client";
import { Message } from "../../types/chat";
import React from "react";
import { motion } from 'motion/react';

interface ChatMessageProps {
  message: Message;
}

export default function ChatMessage({ message }: ChatMessageProps) {
  // Function to format text with bold and italic styling
  const formatText = (text: string) => {
    // Split by newlines first
    return text.split('\n').map((line, lineIndex) => {
      // Check if line starts with "- " for bullet points
      const isBulletPoint = line.startsWith("- ");
      // Remove the "- " if it's a bullet point
      const processedLine = isBulletPoint ? line.substring(2) : line;
      
      // Process line for formatting
      let formattedParts: React.ReactNode[] = [];
      let currentText = processedLine;
      
      // Process bold text (** **)
      const boldRegex = /\*\*(.*?)\*\*/g;
      let boldMatch;
      let lastIndex = 0;
      
      while ((boldMatch = boldRegex.exec(currentText)) !== null) {
        // Add text before the match
        formattedParts.push(currentText.substring(lastIndex, boldMatch.index));
        // Add the bold text
        formattedParts.push(<strong key={`bold-${lineIndex}-${boldMatch.index}`}>{boldMatch[1]}</strong>);
        lastIndex = boldMatch.index + boldMatch[0].length;
      }
      
      // Add remaining text
      formattedParts.push(currentText.substring(lastIndex));
      
      // Now process the parts for italic formatting
      const processedParts = formattedParts.map((part, partIndex) => {
        if (typeof part !== 'string') return part;
        
        // Process italic text (* *)
        const italicRegex = /\*(.*?)\*/g;
        let italicMatch;
        let italicParts: React.ReactNode[] = [];
        let lastItalicIndex = 0;
        let italicText = part;
        
        while ((italicMatch = italicRegex.exec(italicText)) !== null) {
          // Add text before the match
          italicParts.push(italicText.substring(lastItalicIndex, italicMatch.index));
          // Add the italic text
          italicParts.push(<em key={`italic-${lineIndex}-${partIndex}-${italicMatch.index}`}>{italicMatch[1]}</em>);
          lastItalicIndex = italicMatch.index + italicMatch[0].length;
        }
        
        // Add remaining text
        italicParts.push(italicText.substring(lastItalicIndex));
        
        return italicParts;
      });
      
      // Flatten array and return line with appropriate styling
      return (
        <React.Fragment key={`line-${lineIndex}`}>
          {isBulletPoint ? (
            <div className="flex items-start">
              <span className="mr-2">•</span>
              <div>{processedParts.flat()}</div>
            </div>
          ) : (
            processedParts.flat()
          )}
          {lineIndex < text.split('\n').length - 1 && <br />}
        </React.Fragment>
      );
    });
  };

  // Determine message alignment class based on sender
  const messageAlignmentClass = message.sender === 'user' 
    ? 'ml-auto text-right' 
    : message.sender === 'system'
      ? 'mx-auto text-center' 
      : 'mr-auto'; 

  // Determine animation properties based on sender
  const animationProps = {
    initial: { 
      opacity: 0, 
      y: 10,
      x: message.sender === 'user' ? 20 : message.sender === 'system' ? 0 : -20
    },
    animate: { 
      opacity: 1, 
      y: 0,
      x: 0
    },
    transition: { 
      duration: 0.3,
      ease: "easeOut"
    }
  };

  return (
    <motion.div 
      className={`mb-4 ${messageAlignmentClass}`}
      {...animationProps}
    >
      <div 
        className={`inline-block p-3 rounded-lg max-w-[80%] ${
          message.sender === 'user' 
            ? 'rounded-tr-none' 
            : message.sender === 'system'
              ? 'bg-transparent italic' 
              : 'rounded-tl-none'
        }`}
        style={{
          backgroundColor: message.sender === 'user' 
            ? "var(--dark)" 
            : message.sender === 'system'
              ? "transparent" 
              : "var(--secondary)",
          color: message.sender === 'user' 
            ? "var(--light)" 
            : message.sender === 'system'
              ? "var(--foreground)" 
              : "var(--light)"
        }}
      >
        {formatText(message.text)}
      </div>
      <div className="text-xs mt-1" style={{ color: "var(--dark)" }}>
        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </div>
    </motion.div>
  );
}
