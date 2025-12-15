# Session Log 2025-10-14


## How session logging works (2025-10-14 09:01:24)
Let me examine the session logging script to understand how it works. 

Read [](file:///g%3A/repos/QuestionManager/PromptTracking/session-log.ps1)

Now let me also check the README file to see if there are any recent changes that provide additional context: 

Read [](file:///g%3A/repos/QuestionManager/PromptTracking/Session%20Logging%20README.md)

## How the Session Logging Code Works

This is a PowerShell-based session logging system designed to quickly capture clipboard content into organized markdown log files. Here's how it works:

### **Core Functionality**

**1. Script Parameters:**
- `$Path` - Optional custom file path (defaults to daily log in PromptTracking folder)
- `$Section` - Creates level-2 markdown heading for the entry
- `$Title` - Custom section title (requires -Section flag)
- `$CodeBlock` - Wraps clipboard content in markdown code fences (```)
- `$Quiet` - Suppresses confirmation output

**2. File Path Resolution:**
```powershell
function Get-SessionLogPath {
  param([string]$Explicit)
  if ($Explicit) { return (Resolve-Path -LiteralPath $Explicit -ErrorAction SilentlyContinue) ?? $Explicit }
  $dir = Join-Path $PSScriptRoot '.'
  $date = Get-Date -Format 'yyyyMMdd'
  return Join-Path $dir "Session Log $date.md"
}
```
- If no explicit path provided, creates daily log file: `Session Log 20251014.md`
- Files are stored in the same directory as the script (PromptTracking)

**3. Content Processing:**
- Retrieves clipboard content with `Get-Clipboard -Raw`
- Exits with warning if clipboard is empty
- Generates timestamp in ISO format: `2025-10-14 10:30:15`

**4. Header Generation:**
```powershell
$header = if ($Section) {
  if ($Title) { "`n## $Title ($timestamp)`n" } else { "`n## Entry $timestamp`n" }
} else { "`n[$timestamp]`n" }
```
- **Basic entry**: `[2025-10-14 10:30:15]`
- **Section entry**: `## Entry 2025-10-14 10:30:15`
- **Title section**: `## Bug Fix (2025-10-14 10:30:15)`

**5. Code Block Wrapping:**
```powershell
if ($CodeBlock) { $content = "``````n$content`n``````" }
```
- Wraps clipboard content in triple backticks for proper markdown code formatting

**6. File Operations:**
- Creates new daily log file with date header if it doesn't exist
- Appends formatted content using `Add-Content` with UTF8 encoding
- Provides green confirmation message unless `-Quiet` is specified

### **Workflow Integration**

The system includes terminal aliases (`log-aliases.ps1`) for rapid access:
- `log` - Basic timestamp entry
- `logs` - Section with heading
- `logc` - Code block with proper formatting
- `logt` - Custom title section

### **VS Code Integration**
The system works with VS Code tasks and keybindings for seamless development workflow integration, allowing you to quickly log code snippets, conversation notes, or debugging output directly from your clipboard.

### **Key Benefits**
1. **Speed** - One command to log clipboard content
2. **Organization** - Daily files with timestamps and sections
3. **Markdown Ready** - Proper formatting for documentation
4. **Development Focused** - Code block support with syntax highlighting
5. **Flexible** - Works standalone or with terminal aliases

This creates a comprehensive logging system perfect for tracking development sessions, conversations, and code changes throughout your project work.

