# Session Logging System - Installation Guide

A step-by-step guide to install and set up the Session Logging System for your ChatGPT projects.

## Prerequisites

### PowerShell Installation

**Windows 10/11:**
PowerShell is pre-installed. To verify or upgrade to PowerShell 7+:

1. **Check current version:**
   ```powershell
   $PSVersionTable.PSVersion
   ```

2. **Install PowerShell 7+ (recommended):**
   - Download from: https://github.com/PowerShell/PowerShell/releases
   - Or use Windows Package Manager:
   ```cmd
   winget install Microsoft.PowerShell
   ```

**macOS:**
```bash
brew install powershell
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install -y powershell
```

### Required Permissions
- Ability to create directories and files
- PowerShell execution policy allowing scripts (see Setup section)

## Installation Steps

### Step 1: Create Your Project Directory

Choose a location for your ChatGPT project and create the directory:

**In Command Prompt:**
```cmd
mkdir "C:\Path\To\Your\ProjectName"
```

**In PowerShell:**
```powershell
New-Item -Path "C:\Path\To\Your\ProjectName" -ItemType Directory
```

**Examples:**
```cmd
mkdir "C:\Users\YourName\Documents\ChatGPT Projects\Parkinsons Research"
```
```powershell
New-Item -Path "C:\Users\YourName\Documents\ChatGPT Projects\Parkinsons Research" -ItemType Directory
```

### Step 2: Navigate to Your Project Directory

**In Command Prompt:**
```cmd
cd "C:\Path\To\Your\ProjectName"
```

**In PowerShell:**
```powershell
Set-Location "C:\Path\To\Your\ProjectName"
```

**Examples:**
```cmd
cd "C:\Users\YourName\Documents\ChatGPT Projects\Parkinsons Research"
```
```powershell
Set-Location "C:\Users\YourName\Documents\ChatGPT Projects\Parkinsons Research"
```

### Step 3: Extract the Session Logging System

1. **Download** the `ProjectTracking.zip` file
2. **Extract** the contents into your project directory:
   - Right-click the ZIP file → "Extract All..."
   - Choose your project directory as the destination
   - Ensure the `PromptTracking` folder is directly in your project root

**Your directory structure should look like:**
```
C:\Path\To\Your\ProjectName\
├── PromptTracking\
│   ├── session-log.ps1
│   ├── log-aliases.ps1
│   ├── Session Logging README.md
│   ├── Installation Guide.md
│   └── How Session Logging Works.md
└── (your other project files)
```

### Step 4: Set PowerShell Execution Policy (If Needed)

If you get execution policy errors, run PowerShell as Administrator and execute:

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

This allows locally created scripts to run while maintaining security for downloaded scripts.

## Initial Setup and Testing

### Step 1: Navigate to PromptTracking Directory
```powershell
cd PromptTracking
```

### Step 2: Load the Terminal Aliases
```powershell
. .\log-aliases.ps1
```

### Step 3: Test the System
1. **Copy some text to your clipboard** (Ctrl+C)
2. **Run a test command:**
   ```powershell
   log
   ```
3. **Check the result:**
   - A new file should be created: `Session Log YYYYMMDD.md`
   - Your clipboard content should be appended with a timestamp

## Next Steps

### Read the Documentation
1. **Start here:** Read `Session Logging README.md` for usage instructions
   ```powershell
   Get-Content "Session Logging README.md"
   ```

2. **For deeper understanding:** Read `How Session Logging Works.md`
   ```powershell
   Get-Content "How Session Logging Works.md"
   ```

### Make Aliases Permanent (Optional)
To load aliases automatically in new PowerShell sessions:

1. **Open your PowerShell profile:**
   ```powershell
   notepad $PROFILE
   ```

2. **Add this line to auto-load aliases:**
   ```powershell
   # Auto-load session logging aliases (adjust path as needed)
   if (Test-Path "C:\Path\To\Your\ProjectName\PromptTracking\log-aliases.ps1") {
       . "C:\Path\To\Your\ProjectName\PromptTracking\log-aliases.ps1"
   }
   ```

## Quick Reference Commands

After loading aliases with `. .\log-aliases.ps1`:

```powershell
log     # Basic clipboard entry with timestamp
logs    # Section entry with heading  
logc    # Code block with proper markdown formatting
logt    # Custom title section (prompts for title)
```

## Troubleshooting

### "Cannot be loaded because running scripts is disabled"
- Run PowerShell as Administrator
- Execute: `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`

### "The term 'log' is not recognized"
- Ensure you've loaded aliases: `. .\log-aliases.ps1`
- Check you're in the PromptTracking directory

### Clipboard appears empty
- Ensure you've copied content to clipboard (Ctrl+C)
- Try with simple text first

### File encoding issues
- The system uses UTF8 encoding by default
- If you see encoding problems, ensure your text editor supports UTF8

## Support

For issues or questions:
1. Check the `Session Logging README.md` file
2. Review the `How Session Logging Works.md` file for technical details
3. Verify all installation steps were followed correctly

---

**Happy logging! 📝**