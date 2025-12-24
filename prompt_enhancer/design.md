# Prompt Enhancer - Design Style Guide

## Design Philosophy

### Visual Language: Professional Developer Tool Aesthetic
Drawing inspiration from modern developer tools like VS Code, Figma, and Linear, the design embraces a sophisticated dark theme that conveys technical competence and professional polish. The aesthetic balances minimalism with purposeful visual hierarchy, ensuring that functionality remains paramount while creating an environment that feels both powerful and approachable.

### Color Palette: Sophisticated Dark Mode
- **Primary Background**: Deep charcoal (#1a1a1a) - provides excellent contrast without harsh black
- **Secondary Background**: Darker charcoal (#0f0f0f) - for panels and elevated surfaces  
- **Accent Background**: Warm gray (#2a2a2a) - for interactive hover states and subtle differentiation
- **Primary Accent**: Soft amber (#d4a237) - inspired by terminal amber displays, used sparingly for key actions
- **Secondary Accent**: Muted teal (#4a9b8e) - for success states and secondary actions
- **Text Primary**: Light gray (#e0e0e0) - high contrast for readability
- **Text Secondary**: Medium gray (#a0a0a0) - for supporting information
- **Text Muted**: Dark gray (#6a6a6a) - for less important metadata
- **Border Color**: Subtle gray (#333333) - minimal visual separation
- **Error/Warning**: Muted red (#c85a54) and orange (#d49a6a) - softened but still recognizable

### Typography: Technical Precision
- **Primary Font**: "JetBrains Mono" - monospace font that reinforces the developer tool aesthetic while maintaining excellent readability
- **Secondary Font**: "Inter" - clean sans-serif for UI elements and body text
- **Code Font**: "Fira Code" - with ligatures for enhanced code readability
- **Font Hierarchy**: 
  - Headers: 24px-32px, bold weight
  - Subheaders: 18px-20px, medium weight  
  - Body: 14px-16px, regular weight
  - Code/Details: 12px-14px, regular weight

## Visual Effects & Animation Strategy

### Core Libraries Integration
**Animation Framework**: Anime.js for smooth, precise micro-interactions
- Subtle button press animations (scale 0.98x)
- Smooth panel transitions (opacity + translateY)
- Enhancement progress indicators with elastic easing

**Text Effects**: Typed.js for dynamic typing simulation
- Realistic typing animation during enhancement process
- Character-by-character reveal for enhanced prompts
- Cursor blink effects that match terminal aesthetics

**Visual FX**: Subtle shader effects for depth
- Very subtle noise texture overlay on background (2% opacity)
- Soft glow effects around active input areas
- Minimal particle system for enhancement completion celebration

**Data Visualization**: ECharts.js for enhancement metrics
- Dark theme charts with amber/teal color scheme
- Smooth transitions between data states
- Minimal, technical styling that matches overall aesthetic

### Micro-Interaction Design
**Enhancement Process Animation**:
- Input field gently dims and adds subtle loading overlay
- Progress indicator with technical styling (bracket-style progress bar)
- Smooth text replacement with fade transition
- Success state with brief amber glow effect

**Keyboard Shortcut Feedback**:
- Subtle key press visualization in corner of screen
- Brief highlight on elements when shortcuts are used
- Smooth focus transitions between interface elements

**Context Panel Interactions**:
- Smooth slide-in animations for side panels
- Hover effects with subtle elevation and glow
- Interactive elements respond with gentle scale and color transitions

### Header & Background Effects
**Background Treatment**: Consistent dark gradient with subtle texture
- Base: Linear gradient from #1a1a1a to #0f0f0f
- Overlay: Subtle noise texture for depth without distraction
- No section-based background changes - maintains continuity

**Header Effect**: Minimal but distinctive
- Clean, centered layout with generous whitespace
- Subtle backdrop blur effect when scrolling
- Animated accent line that pulses gently with user activity

**Interactive Elements**: Technical precision
- Buttons: Rounded corners (4px) with subtle shadows
- Input fields: Minimal borders that strengthen on focus
- Cards: Clean elevation with soft shadows
- Code blocks: Subtle syntax highlighting with muted colors

## Layout & Spacing Philosophy

### Grid System
- 8px base unit for consistent spacing
- Generous padding (24px-32px) around major sections
- Compact but readable spacing for dense information areas
- Responsive breakpoints that maintain visual hierarchy

### Component Hierarchy
- **Primary Actions**: Amber accent color, prominent placement
- **Secondary Actions**: Teal accent, subtle styling
- **Tertiary Actions**: Muted gray, minimal visual weight
- **Information Display**: Clean typography hierarchy with consistent spacing

### Responsive Behavior
- Desktop-first approach optimized for developer workflows
- Side panels that collapse gracefully on smaller screens
- Touch-friendly targets for mobile users (minimum 44px)
- Maintained functionality across all device sizes

This design system creates a cohesive, professional environment that feels both technically sophisticated and intuitively usable, perfectly suited for a prompt enhancer tool that developers will rely on for their daily workflow.