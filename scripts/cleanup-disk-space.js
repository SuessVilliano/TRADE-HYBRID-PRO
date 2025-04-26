#!/usr/bin/env node

/**
 * Disk Space Cleanup Script for Trade Hybrid Platform
 * 
 * This script helps to clean up unnecessary files and reduce disk space usage.
 * Run this script when disk space is getting low.
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

// Print pretty header
console.log('\n===================================================');
console.log('   TRADE HYBRID PLATFORM - DISK SPACE CLEANUP      ');
console.log('===================================================\n');

// Function to format bytes to human-readable size
function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
}

// Check current disk space
try {
  console.log('Current disk space usage:');
  const diskUsage = execSync('df -h . | tail -1').toString().trim().split(/\s+/);
  const total = diskUsage[1];
  const used = diskUsage[2];
  const available = diskUsage[3];
  const percentUsed = diskUsage[4];
  
  console.log(`Total: ${total}, Used: ${used}, Available: ${available}, Used%: ${percentUsed}`);
  console.log('');
} catch (error) {
  console.error('Error checking disk space:', error.message);
}

// 1. Clean up build files
console.log('Step 1: Cleaning up build and temporary files...');
const dirsToClean = [
  './dist',
  './temp',
  './.cache',
  './client/dist',
  './client/.cache'
];

let totalCleaned = 0;

dirsToClean.forEach(dirPath => {
  try {
    if (fs.existsSync(dirPath)) {
      const stats = fs.statSync(dirPath);
      const dirSize = getDirectorySize(dirPath);
      
      console.log(`Removing ${dirPath} (${formatBytes(dirSize)})...`);
      execSync(`rm -rf ${dirPath}`);
      
      totalCleaned += dirSize;
      console.log(`✓ Removed ${formatBytes(dirSize)}`);
    }
  } catch (error) {
    console.error(`Error cleaning ${dirPath}:`, error.message);
  }
});

// 2. Clean npm cache
console.log('\nStep 2: Cleaning npm cache...');
try {
  console.log('Running npm cache clean...');
  execSync('npm cache clean --force');
  console.log('✓ npm cache cleaned');
} catch (error) {
  console.error('Error cleaning npm cache:', error.message);
}

// 3. Remove unused dependencies
console.log('\nStep 3: Looking for unused npm packages...');
try {
  // This is a simple check that might need manual review
  console.log('Note: This is just a suggestion - manual verification is required before removing any packages');
  
  // List the largest packages
  console.log('\nLargest npm packages:');
  const largestPackages = execSync('du -sh node_modules/* | sort -hr | head -10').toString().trim();
  console.log(largestPackages);
  
  // Potentially unused packages that are commonly large
  const potentiallyUnused = [
    '@walletconnect/web3-provider', // If not using WalletConnect
    'pixi.js',                      // If not using Pixi.js for graphics
    'three',                        // If not using 3D graphics
    'react-icons',                  // Consider replacing with specific icon imports
    'googleapis',                   // If not using Google APIs
    '@metamask/detect-provider',    // If not using Metamask specifically
  ];
  
  console.log('\nPotentially unused large packages:');
  potentiallyUnused.forEach(pkg => {
    console.log(`- ${pkg}`);
  });
  
  console.log('\nTo remove unused packages, use:');
  console.log('npm uninstall package-name-here');
} catch (error) {
  console.error('Error analyzing packages:', error.message);
}

// 4. Check for large files
console.log('\nStep 4: Checking for abnormally large files (>10MB)...');
try {
  console.log('Large files in the project:');
  const largeFiles = execSync('find . -type f -size +10M | grep -v "node_modules" | grep -v ".git"').toString().trim();
  
  if (largeFiles) {
    console.log(largeFiles);
    console.log('\nConsider removing or compressing these files if they are not essential.');
  } else {
    console.log('No unusually large files found outside of node_modules.');
  }
} catch (error) {
  // Not an error if no files found
  console.log('No unusually large files found outside of node_modules.');
}

// 5. Recommendations
console.log('\nStep 5: Additional recommendations:');
console.log('1. Consider removing unused image assets in public/images folder');
console.log('2. If using multiple wallet providers, consider removing unused ones');
console.log('3. Optimize SVG and image files using compression tools');
console.log('4. Review your database for large unnecessary tables or logs');
console.log('5. Consider updating .gitignore to prevent committing large files');

// Function to get directory size recursively
function getDirectorySize(directoryPath) {
  let totalSize = 0;
  
  try {
    const files = fs.readdirSync(directoryPath);
    
    for (const file of files) {
      const filePath = path.join(directoryPath, file);
      const stats = fs.statSync(filePath);
      
      if (stats.isDirectory()) {
        totalSize += getDirectorySize(filePath);
      } else {
        totalSize += stats.size;
      }
    }
  } catch (error) {
    console.error(`Error calculating size of ${directoryPath}:`, error.message);
  }
  
  return totalSize;
}

// Output final results
console.log('\n===================================================');
console.log(`Total space cleaned: ${formatBytes(totalCleaned)}`);
console.log('===================================================\n');

// Check disk space after cleanup
try {
  console.log('Disk space after cleanup:');
  const diskUsageAfter = execSync('df -h . | tail -1').toString().trim().split(/\s+/);
  const totalAfter = diskUsageAfter[1];
  const usedAfter = diskUsageAfter[2];
  const availableAfter = diskUsageAfter[3];
  const percentUsedAfter = diskUsageAfter[4];
  
  console.log(`Total: ${totalAfter}, Used: ${usedAfter}, Available: ${availableAfter}, Used%: ${percentUsedAfter}`);
} catch (error) {
  console.error('Error checking disk space:', error.message);
}

console.log('\nFor more advanced options to increase disk space, see:');
console.log('https://docs.replit.com/programming-ide/workspace-management#managing-storage');