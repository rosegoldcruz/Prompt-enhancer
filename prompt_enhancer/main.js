// Prompt Enhancer - Main Application Logic
class PromptEnhancer {
    constructor() {
        this.history = JSON.parse(localStorage.getItem('enhancementHistory') || '[]');
        this.settings = JSON.parse(localStorage.getItem('enhancerSettings') || '{}');
        this.currentPrompt = '';
        this.isEnhancing = false;
        this.currentRequestController = null;
        this.progressTimer = null;
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.setupKeyboardShortcuts();
        this.loadHistory();
        this.initAnimations();
    }
    
    setupEventListeners() {
        // Input handling
        const promptInput = document.getElementById('promptInput');
        const enhanceBtn = document.getElementById('enhanceBtn');
        const clearBtn = document.getElementById('clearBtn');
        const copyBtn = document.getElementById('copyEnhancedBtn');
        const clearHistoryBtn = document.getElementById('clearHistoryBtn');
        
        promptInput?.addEventListener('input', (e) => {
            this.currentPrompt = e.target.value;
            this.updateCharCount();
        });
        
        enhanceBtn?.addEventListener('click', () => this.enhancePrompt());
        clearBtn?.addEventListener('click', () => this.clearInput());
        copyBtn?.addEventListener('click', () => this.copyEnhanced());
        clearHistoryBtn?.addEventListener('click', () => this.clearHistory());
        
    }
    
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl+P for enhancement
            if (e.ctrlKey && e.key === 'p') {
                e.preventDefault();
                if (!this.isEnhancing) {
                    this.enhancePrompt();
                }
            }
            
            // Escape to cancel
            if (e.key === 'Escape' && this.isEnhancing) {
                this.cancelEnhancement();
            }
            
            // Ctrl+Z to undo (restore last prompt)
            if (e.ctrlKey && e.key === 'z') {
                e.preventDefault();
                this.undoLastEnhancement();
            }
        });
    }
    
    setupContextDetection() {
        // Auto-detect project type based on input
        this.projectPatterns = {
            react: ['react', 'jsx', 'component', 'hook', 'usestate', 'useeffect'],
            nodejs: ['node', 'express', 'api', 'middleware', 'route', 'server'],
            python: ['python', 'django', 'flask', 'def', 'class', 'import'],
            mobile: ['mobile', 'react native', 'flutter', 'ios', 'android'],
            web: ['html', 'css', 'javascript', 'dom', 'browser', 'frontend'],
            ai: ['ai', 'ml', 'machine learning', 'neural', 'model', 'training'],
            realtime: ['livekit', 'webrtc', 'websocket', 'realtime', 'rtc', 'stream', 'audio', 'voice'],
            devops: ['vercel', 'docker', 'kubernetes', 'ci', 'cd', 'deploy', 'github actions', 'systemd']
        };
    }
    
    detectContext() {
        const prompt = this.currentPrompt.toLowerCase();
        let detectedType = 'general';
        let maxMatches = 0;
        
        for (const [type, patterns] of Object.entries(this.projectPatterns)) {
            const matches = patterns.filter(pattern => prompt.includes(pattern)).length;
            if (matches > maxMatches) {
                maxMatches = matches;
                detectedType = type;
            }
        }
        
        if (detectedType !== 'general' && maxMatches > 0) {
            const projectTypeSelect = document.getElementById('projectType');
            if (projectTypeSelect && projectTypeSelect.value === 'general') {
                projectTypeSelect.value = detectedType;
                this.saveContext();
                this.showNotification(`Detected ${detectedType} project context`);
            }
        }
    }
    
    async enhancePrompt() {
        if (!this.currentPrompt.trim() || this.isEnhancing) return;
        
        this.isEnhancing = true;
        const originalPrompt = this.currentPrompt;
        
        // Update UI state
        this.setEnhancementStatus('enhancing', 'Enhancing your prompt...');
        this.showEnhancementOverlay();
        
        try {
            const context = this.getDefaultContext();
            const enhancementLevel = 'smart';
            this.startProgressAnimation();

            const enhancedPrompt = await this.requestDeepSeekEnhancement(originalPrompt, context, enhancementLevel);
            
            // Display enhanced prompt
            this.displayEnhancedPrompt(enhancedPrompt);
            
            // Add to history
            this.addToHistory(originalPrompt, enhancedPrompt);
            
            // Update status
            this.setEnhancementStatus('success', 'Enhancement complete!');
            this.showNotification('Prompt enhanced successfully');
            
        } catch (error) {
            const message = error?.message || 'Enhancement failed. Please try again.';
            this.setEnhancementStatus('error', 'Enhancement failed');
            this.showNotification(message, 'error');
        } finally {
            this.stopProgressAnimation();
            this.currentRequestController = null;
            this.isEnhancing = false;
            this.hideEnhancementOverlay();
        }
    }

    async requestDeepSeekEnhancement(prompt, context, enhancementLevel) {
        this.currentRequestController = new AbortController();

        const response = await fetch('/api/enhance', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                prompt,
                context,
                enhancementLevel
            }),
            signal: this.currentRequestController.signal
        });

        const payload = await response.json().catch(() => ({}));

        if (!response.ok) {
            throw new Error(payload.error || 'Enhancement request failed');
        }

        if (!payload.enhancedPrompt) {
            throw new Error('Empty response from enhancement service');
        }

        return payload.enhancedPrompt;
    }

    startProgressAnimation() {
        const progressBar = document.getElementById('enhancementProgressBar');
        if (!progressBar) return;

        let progress = 5;
        progressBar.style.width = `${progress}%`;

        this.progressTimer = setInterval(() => {
            if (progress < 90) {
                progress += Math.max(1, (90 - progress) * 0.08);
                progressBar.style.width = `${Math.min(progress, 90)}%`;
            }
        }, 150);
    }

    stopProgressAnimation() {
        const progressBar = document.getElementById('enhancementProgressBar');

        if (this.progressTimer) {
            clearInterval(this.progressTimer);
            this.progressTimer = null;
        }

        if (progressBar) {
            progressBar.style.width = '100%';
        }
    }

    getDefaultContext() {
        return {
            projectType: 'web',
            framework: 'none',
            teamConventions: '',
            enhancementLevel: 'smart'
        };
    }
    
    async simulateEnhancement(prompt) {
        const context = this.getContext();
        const enhancementLevel = document.querySelector('input[name="enhancementLevel"]:checked')?.value || 'smart';
        
        // Simulate processing time based on prompt complexity
        const complexity = prompt.length / 10;
        const processingTime = Math.min(Math.max(complexity * 100, 1000), 5000);
        
        // Show progress
        await this.showEnhancementProgress(processingTime);
        
        // Generate enhanced prompt based on context and level
        return this.generateEnhancedPrompt(prompt, context, enhancementLevel);
    }
    
    async showEnhancementProgress(totalTime) {
        const progressBar = document.getElementById('enhancementProgressBar');
        const steps = 20;
        const stepTime = totalTime / steps;
        
        for (let i = 0; i <= steps; i++) {
            const progress = (i / steps) * 100;
            progressBar.style.width = `${progress}%`;
            await new Promise(resolve => setTimeout(resolve, stepTime));
        }
    }
    
    generateEnhancedPrompt(prompt, context, level) {
        // IMPORTANT: This app is an offline/demo enhancer (no API calls). The value is
        // in turning vague requests into *executable*, tool-friendly prompts.
        // Output is always a single pasteable block (no back-and-forth).
        const normalized = (prompt || '').trim();
        const base = this.getBaseEnhancement(normalized, context);

        // New AEON-style enhancement pipeline (more strict, more actionable)
        switch (level) {
            case 'quick':
                return this.buildExecutionPrompt(base, context, { depth: 'quick' });
            case 'comprehensive':
                return this.buildExecutionPrompt(base, context, { depth: 'comprehensive' });
            default: // smart
                return this.buildExecutionPrompt(base, context, { depth: 'smart' });
        }
    }

    /**
     * Build a single-block, execution-first prompt suitable for coding agents.
     * Design goals:
     * - No "questions". Make best assumptions and proceed.
     * - No placeholders. If a secret/credential is required, implement a clean guard path
     *   (feature flags, graceful fallbacks) so the app runs without it.
     * - Force artifacts: files, diffs, commands, acceptance criteria.
     */
    buildExecutionPrompt(base, context, opts = { depth: 'smart' }) {
        const depth = opts.depth || 'smart';
        const rawUserIntent = (this.currentPrompt || '').trim();

        const projectType = context.projectType || 'general';
        const framework = context.framework && context.framework !== 'none' ? context.framework : '';
        const teamConventions = (context.teamConventions || '').trim();

        const isWeb = ['react', 'web', 'nodejs'].includes(projectType) || /next\.?js|tailwind|framer|clerk|supabase|vercel/i.test(rawUserIntent);
        const isBackend = ['nodejs', 'python'].includes(projectType) || /api|backend|server|db|schema|supabase|postgres|redis/i.test(rawUserIntent);
        const isUI = ['react', 'web', 'mobile'].includes(projectType) || /ui|ux|landing|dashboard|page|component|layout|animation|motion/i.test(rawUserIntent);

        const assumptions = [];
        // Opinionated defaults that prevent "one-sentence" sites and broken builds
        if (isWeb) {
            assumptions.push('Use Next.js App Router + TypeScript + TailwindCSS.');
            assumptions.push('Use shadcn/ui for base components and Framer Motion for animations.');
            assumptions.push('Deliver a multi-page marketing site + auth + dashboard (no single-page placeholder builds).');
            assumptions.push('If auth/DB keys are missing, app must still run with a safe local/dev fallback (no white screen).');
        }
        if (isBackend) {
            assumptions.push('Implement robust error handling, input validation, and structured logging.');
            assumptions.push('No mock endpoints that pretend to work—use real code paths with graceful fallbacks when secrets are absent.');
        }
        if (assumptions.length === 0) {
            assumptions.push('Proceed with best-practice defaults and make reasonable assumptions without asking follow-up questions.');
        }

        const deliverables = [];
        if (isWeb) {
            deliverables.push('A clear file tree (what files are created/modified).');
            deliverables.push('Copy-pasteable code for each file you change (or a unified patch).');
            deliverables.push('A production-safe env strategy: required vs optional env vars, with runtime guards.');
            deliverables.push('A "Run locally" section: exact commands.');
        }
        if (isUI) {
            deliverables.push('UI structure with sections, components, and motion interactions (scroll/hover/entrance).');
            deliverables.push('No low-content pages: each page must include meaningful copy + sections.');
        }
        if (isBackend) {
            deliverables.push('API endpoints, request/response shapes, and validation.');
            deliverables.push('Persistence layer schema/migrations if applicable.');
        }
        if (deliverables.length === 0) {
            deliverables.push('Concrete steps + the actual artifacts needed to ship (code, config, tests if relevant).');
        }

        const acceptance = [];
        acceptance.push('Must run without crashing even when optional third-party API keys are missing (show a clear in-app setup banner instead).');
        acceptance.push('No placeholder copy like “Lorem ipsum” or “TODO”.');
        acceptance.push('No stubs that fake success; if a feature is unavailable due to missing creds, it must degrade gracefully.');
        if (isWeb) {
            acceptance.push('Site has at least: Home, Features/Product, Pricing, Auth (login/signup), Dashboard pages.');
            acceptance.push('Animations are tasteful, fast, and do not block usability; motion reduced when prefers-reduced-motion is enabled.');
        }

        // Depth controls how much structure we add
        const depthAddendum = {
            quick: {
                extras: [
                    'Keep it concise. Deliver the minimal working implementation that satisfies the acceptance criteria.'
                ]
            },
            smart: {
                extras: [
                    'Ship a clean, production-grade solution. Avoid overengineering but do not cut core quality.'
                ]
            },
            comprehensive: {
                extras: [
                    'Include hardening: edge cases, security notes, and basic observability (logging/metrics) where appropriate.',
                    'Include a quick verification checklist.'
                ]
            }
        }[depth] || { extras: [] };

        const ctxLine = context.projectType !== 'general'
            ? `Context: ${context.projectType}${framework ? ` (${framework})` : ''}`
            : 'Context: general';

        const parts = [];
        parts.push('ROLE');
        parts.push('You are a senior full-stack engineer + product designer. You build shippable systems, not demos.');
        parts.push('');
        parts.push('NON-NEGOTIABLE RULES');
        parts.push('1) Do NOT ask follow-up questions. Make best assumptions and proceed.');
        parts.push('2) Do NOT output placeholder code or placeholder copy.');
        parts.push('3) If an API key/secret is missing, the app must still run with graceful degradation and a clear setup banner.');
        parts.push('4) Output must be directly usable: provide file paths + code (or patch) + exact commands to run.');
        parts.push('');
        parts.push(ctxLine);
        if (teamConventions) {
            parts.push(`Team conventions to follow: ${teamConventions}`);
        }
        parts.push('');
        parts.push('USER INTENT (RAW)');
        parts.push(rawUserIntent || base.trim());
        parts.push('');
        parts.push('ASSUMPTIONS (PROCEED UNDER THESE DEFAULTS)');
        assumptions.forEach(a => parts.push(`- ${a}`));
        parts.push('');
        parts.push('DELIVERABLES');
        deliverables.forEach(d => parts.push(`- ${d}`));
        parts.push('');
        parts.push('ACCEPTANCE CRITERIA');
        acceptance.forEach(a => parts.push(`- ${a}`));
        parts.push('');
        parts.push('EXECUTION PLAN');
        const steps = this.generateSteps(base, context);
        steps.slice(0, depth === 'quick' ? 5 : depth === 'smart' ? 8 : 12).forEach((s, i) => {
            parts.push(`${i + 1}. ${s}`);
        });
        parts.push('');
        depthAddendum.extras.forEach(x => parts.push(`NOTE: ${x}`));
        parts.push('');
        parts.push('OUTPUT FORMAT');
        parts.push('- Start with a short summary of what you are changing.');
        parts.push('- Then provide a file tree of changed/added files.');
        parts.push('- Then provide code grouped by file path.');
        parts.push('- End with exact run/deploy commands and a verification checklist.');

        return parts.join('\n');
    }
    
    getBaseEnhancement(prompt, context) {
        // Basic structure enhancement
        let enhanced = `${prompt.trim()}\n\n`;
        
        // Add context-aware structure
        if (context.projectType !== 'general') {
            enhanced += `Context: This is a ${context.projectType} project`;
            if (context.framework !== 'none') {
                enhanced += ` using ${context.framework}`;
            }
            enhanced += `.\n\n`;
        }
        
        // Note: we intentionally avoid injecting speculative "abstract" expansions here.
        // The execution prompt builder handles structure and assumptions without derailing intent.
        
        return enhanced;
    }
    
    applySmartEnhancement(base, context) {
        let enhanced = base;
        
        // Add numbered steps based on prompt content
        const steps = this.generateSteps(base, context);
        if (steps.length > 0) {
            enhanced += `Please:\n`;
            steps.forEach((step, index) => {
                enhanced += `${index + 1}. ${step}\n`;
            });
            enhanced += `\n`;
        }
        
        // Add context-specific considerations
        const considerations = this.generateConsiderations(context);
        if (considerations.length > 0) {
            enhanced += `Considerations:\n`;
            considerations.forEach(consideration => {
                enhanced += `• ${consideration}\n`;
            });
        }
        
        return enhanced;
    }
    
    applyQuickEnhancement(base, context) {
        return base + `Please provide a focused solution that addresses the core requirements efficiently.`;
    }
    
    applyComprehensiveEnhancement(base, context) {
        let enhanced = this.applySmartEnhancement(base, context);
        
        // Add additional sections for comprehensive mode
        enhanced += `\n\nDeliverables:\n`;
        enhanced += `• Clear implementation steps\n`;
        enhanced += `• Code examples where applicable\n`;
        enhanced += `• Testing considerations\n`;
        enhanced += `• Documentation updates\n`;
        
        if (context.teamConventions) {
            enhanced += `\nTeam Conventions:\n`;
            enhanced += `• Follow established patterns: ${context.teamConventions}\n`;
        }
        
        return enhanced;
    }
    
    generateSteps(base, context) {
        const steps = [];
        const prompt = base.toLowerCase();
        
        // Handle abstract/high-level prompts with more sophisticated logic
        if (this.isAbstractPrompt(prompt)) {
            return this.generateAbstractSteps(prompt, context);
        }
        
        if (prompt.includes('bug') || prompt.includes('fix')) {
            steps.push('Identify the root cause of the issue');
            steps.push('Review relevant code files and dependencies');
            steps.push('Implement the fix following best practices');
            steps.push('Test the solution thoroughly');
            steps.push('Update documentation if needed');
        } else if (prompt.includes('test') || prompt.includes('testing')) {
            steps.push('Analyze the existing test coverage');
            steps.push('Design comprehensive test cases');
            steps.push('Implement tests following the testing framework');
            steps.push('Ensure tests are isolated and repeatable');
            steps.push('Run tests and verify they pass');
        } else if (prompt.includes('feature') || prompt.includes('add')) {
            steps.push('Review requirements and specifications');
            steps.push('Design the implementation approach');
            steps.push('Implement the feature incrementally');
            steps.push('Add appropriate tests');
            steps.push('Update documentation');
        } else {
            steps.push('Analyze the current implementation');
            steps.push('Identify areas for improvement');
            steps.push('Implement the necessary changes');
            steps.push('Test and validate the solution');
        }
        
        return steps;
    }
    
    isAbstractPrompt(prompt) {
        // Detect abstract/conceptual prompts
        const abstractKeywords = [
            // Keep this list tight. If it's too broad, the enhancer derails normal requests.
            'self-healing',
            'regenerative',
            'fault tolerant',
            'graceful degradation',
            'gracefully',
            'fail safe',
            'circuit breaker',
            'resilience',
            'mttr'
        ];
        
        return abstractKeywords.some(keyword => prompt.includes(keyword));
    }
    
    generateAbstractSteps(prompt, context) {
        const steps = [];
        
        // Parse the abstract requirements into concrete actions
        if (prompt.includes('visualizer')) {
            steps.push('Conduct comprehensive analysis of the current visualizer implementation');
            steps.push('Identify all failure points and edge cases in the visualization pipeline');
            steps.push('Design a resilient architecture with error boundaries and fallback states');
            steps.push('Implement self-healing mechanisms with automatic error recovery');
            steps.push('Add graceful degradation for unsupported scenarios');
            steps.push('Create comprehensive testing for failure scenarios and recovery');
            steps.push('Implement monitoring and alerting for system health');
        }
        
        if (prompt.includes('self-healing') || prompt.includes('regenerative')) {
            steps.push('Design autonomous error detection and correction systems');
            steps.push('Implement circuit breaker patterns to prevent cascade failures');
            steps.push('Create automated recovery procedures with rollback capabilities');
            steps.push('Add health checks and self-diagnostic mechanisms');
            steps.push('Build redundancy and failover strategies');
        }
        
        if (prompt.includes('smooth') || prompt.includes('gracefully')) {
            steps.push('Analyze user experience during error states and transitions');
            steps.push('Design smooth degradation paths that maintain core functionality');
            steps.push('Implement progressive enhancement strategies');
            steps.push('Add loading states and skeleton screens for better UX');
            steps.push('Create user-friendly error messages and recovery options');
        }
        
        if (prompt.includes('failing') || prompt.includes('fail safe')) {
            steps.push('Implement comprehensive error handling at every layer');
            steps.push('Design fail-safe mechanisms with default fallback behaviors');
            steps.push('Add input validation and sanitization throughout the system');
            steps.push('Create emergency shutdown and recovery procedures');
            steps.push('Build monitoring systems to detect failures before they impact users');
        }
        
        // Always include testing and validation steps
        steps.push('Create chaos engineering tests to validate resilience');
        steps.push('Implement continuous monitoring for system health metrics');
        steps.push('Document all failure scenarios and recovery procedures');
        
        return steps;
    }
    
    generateConsiderations(context) {
        const considerations = [];
        const prompt = this.currentPrompt.toLowerCase();
        
        // Handle abstract/conceptual considerations
        if (this.isAbstractPrompt(prompt)) {
            return this.generateAbstractConsiderations(prompt, context);
        }
        
        switch (context.projectType) {
            case 'react':
                considerations.push('Maintain component reusability and separation of concerns');
                considerations.push('Follow React hooks best practices and rules');
                considerations.push('Consider performance implications and optimization opportunities');
                break;
            case 'nodejs':
                considerations.push('Ensure proper error handling and async/await patterns');
                considerations.push('Follow RESTful API design principles if applicable');
                considerations.push('Consider security implications and input validation');
                break;
            case 'python':
                considerations.push('Follow PEP 8 style guidelines and Python best practices');
                considerations.push('Consider type hints for better code clarity');
                considerations.push('Ensure proper exception handling and logging');
                break;
            default:
                considerations.push('Maintain code quality and readability');
                considerations.push('Follow established patterns and conventions');
                considerations.push('Consider maintainability and future extensibility');
        }
        
        if (context.framework !== 'none') {
            considerations.push(`Leverage ${context.framework} specific features and conventions`);
        }
        
        return considerations;
    }
    
    generateAbstractConsiderations(prompt, context) {
        const considerations = [];
        
        considerations.push('Design for resilience - expect failures and plan recovery strategies');
        considerations.push('Prioritize user experience during error states and transitions');
        considerations.push('Implement comprehensive monitoring and observability');
        considerations.push('Follow defensive programming principles');
        considerations.push('Consider the blast radius of failures and implement isolation');
        
        if (prompt.includes('visualizer')) {
            considerations.push('Ensure graceful degradation when data sources fail');
            considerations.push('Implement progressive loading for large datasets');
            considerations.push('Design fallback visualizations for edge cases');
            considerations.push('Consider performance impact of real-time updates');
        }
        
        if (prompt.includes('self-healing')) {
            considerations.push('Implement exponential backoff for retry mechanisms');
            considerations.push('Design idempotent operations to handle duplicate executions');
            considerations.push('Use circuit breakers to prevent cascade failures');
            considerations.push('Monitor system health metrics proactively');
        }
        
        if (prompt.includes('smooth') || prompt.includes('gracefully')) {
            considerations.push('Design user-centric error messages and recovery flows');
            considerations.push('Implement loading states that provide feedback');
            considerations.push('Consider accessibility in error scenarios');
            considerations.push('Maintain functionality even with partial failures');
        }
        
        if (prompt.includes('failing') || prompt.includes('fail safe')) {
            considerations.push('Implement the principle of least surprise in failure modes');
            considerations.push('Design for graceful degradation, not catastrophic failure');
            considerations.push('Add comprehensive input validation and sanitization');
            considerations.push('Create emergency procedures and runbooks');
        }
        
        considerations.push('Document all assumptions and failure scenarios');
        considerations.push('Test resilience with chaos engineering practices');
        considerations.push('Measure and optimize for mean time to recovery (MTTR)');
        
        return considerations;
    }
    
    displayEnhancedPrompt(enhancedPrompt) {
        const outputDiv = document.getElementById('enhancedOutput');
        const contentDiv = document.getElementById('enhancedContent');
        
        contentDiv.textContent = enhancedPrompt;
        
        // Animate in
        outputDiv.classList.remove('opacity-0', 'pointer-events-none');
        outputDiv.classList.add('opacity-100');
        
        // Scroll to output
        outputDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    
    setEnhancementStatus(type, message) {
        const statusText = document.getElementById('statusText');
        const statusIndicator = document.getElementById('statusIndicator');
        
        statusText.textContent = message;
        statusIndicator.className = `status-indicator ${type}`;
        
        // Reset after 3 seconds for success states
        if (type === 'success') {
            setTimeout(() => {
                statusText.textContent = 'Ready';
                statusIndicator.className = 'status-indicator';
            }, 3000);
        }
    }
    
    showEnhancementOverlay() {
        const overlay = document.getElementById('enhancementOverlay');
        overlay.classList.remove('opacity-0', 'pointer-events-none');
        overlay.classList.add('opacity-100', 'pointer-events-auto');
    }
    
    hideEnhancementOverlay() {
        const overlay = document.getElementById('enhancementOverlay');
        overlay.classList.remove('opacity-100', 'pointer-events-auto');
        overlay.classList.add('opacity-0', 'pointer-events-none');
        
        // Reset progress bar
        document.getElementById('enhancementProgressBar').style.width = '0%';
    }
    
    cancelEnhancement() {
        if (this.isEnhancing && this.currentRequestController) {
            this.currentRequestController.abort();
            this.currentRequestController = null;
        }

        if (this.isEnhancing) {
            this.stopProgressAnimation();
            this.isEnhancing = false;
            this.hideEnhancementOverlay();
            this.setEnhancementStatus('error', 'Enhancement cancelled');
            this.showNotification('Enhancement cancelled');
        }
    }
    
    addToHistory(original, enhanced) {
        const historyItem = {
            id: Date.now(),
            original,
            enhanced,
            timestamp: new Date().toISOString(),
            context: this.getContext()
        };
        
        this.history.unshift(historyItem);
        
        // Keep only last 20 items
        if (this.history.length > 20) {
            this.history = this.history.slice(0, 20);
        }
        
        this.saveHistory();
        this.loadHistory();
    }
    
    loadHistory() {
        const historyList = document.getElementById('historyList');
        if (!historyList) return;
        
        historyList.innerHTML = '';
        
        if (this.history.length === 0) {
            historyList.innerHTML = `
                <div class="text-center text-gray-500 py-8">
                    <p class="text-sm">No enhancement history yet</p>
                    <p class="text-xs mt-1">Your enhanced prompts will appear here</p>
                </div>
            `;
            return;
        }
        
        this.history.forEach((item, index) => {
            const historyElement = this.createHistoryElement(item, index);
            historyList.appendChild(historyElement);
        });
    }
    
    createHistoryElement(item, index) {
        const div = document.createElement('div');
        div.className = 'history-item p-3 rounded-md cursor-pointer';
        div.innerHTML = `
            <div class="flex items-start justify-between mb-2">
                <span class="text-xs text-gray-500">#${this.history.length - index}</span>
                <span class="text-xs text-gray-500">${this.formatTimestamp(item.timestamp)}</span>
            </div>
            <div class="text-sm text-gray-300 mb-2 line-clamp-2">
                ${item.original.substring(0, 80)}${item.original.length > 80 ? '...' : ''}
            </div>
            <div class="flex items-center space-x-2">
                <button class="text-xs text-amber-400 hover:text-amber-300" onclick="promptEnhancer.restoreFromHistory('${item.id}')">
                    Restore
                </button>
                <button class="text-xs text-gray-500 hover:text-gray-300" onclick="promptEnhancer.viewHistoryItem('${item.id}')">
                    View
                </button>
            </div>
        `;
        
        return div;
    }
    
    restoreFromHistory(itemId) {
        const item = this.history.find(h => h.id == itemId);
        if (item) {
            document.getElementById('promptInput').value = item.original;
            this.currentPrompt = item.original;
            this.updateCharCount();
            this.showNotification('Restored from history');
        }
    }
    
    viewHistoryItem(itemId) {
        const item = this.history.find(h => h.id == itemId);
        if (item) {
            // Create a modal or detailed view
            this.showHistoryModal(item);
        }
    }
    
    showHistoryModal(item) {
        // Simple implementation - could be enhanced with a proper modal
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="bg-gray-900 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-lg font-semibold">Enhancement Details</h3>
                    <button onclick="this.parentElement.parentElement.parentElement.remove()" class="text-gray-400 hover:text-white">
                        ✕
                    </button>
                </div>
                <div class="space-y-4">
                    <div>
                        <h4 class="font-medium text-amber-400 mb-2">Original Prompt:</h4>
                        <pre class="bg-gray-800 p-3 rounded text-sm whitespace-pre-wrap">${item.original}</pre>
                    </div>
                    <div>
                        <h4 class="font-medium text-teal-400 mb-2">Enhanced Prompt:</h4>
                        <pre class="bg-gray-800 p-3 rounded text-sm whitespace-pre-wrap">${item.enhanced}</pre>
                    </div>
                    <div class="text-xs text-gray-500">
                        Context: ${item.context.projectType} | ${item.context.framework || 'No framework'}
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }
    
    clearHistory() {
        if (confirm('Are you sure you want to clear all history?')) {
            this.history = [];
            this.saveHistory();
            this.loadHistory();
            this.showNotification('History cleared');
        }
    }
    
    undoLastEnhancement() {
        if (this.history.length > 0) {
            const lastItem = this.history[0];
            document.getElementById('promptInput').value = lastItem.original;
            this.currentPrompt = lastItem.original;
            this.updateCharCount();
            this.showNotification('Restored previous prompt');
        }
    }
    
    clearInput() {
        document.getElementById('promptInput').value = '';
        this.currentPrompt = '';
        this.updateCharCount();
        
        // Hide enhanced output
        const output = document.getElementById('enhancedOutput');
        output.classList.add('opacity-0', 'pointer-events-none');
        output.classList.remove('opacity-100');
    }
    
    copyEnhanced() {
        const content = document.getElementById('enhancedContent').textContent;
        navigator.clipboard.writeText(content).then(() => {
            this.showNotification('Copied to clipboard');
        }).catch(() => {
            this.showNotification('Failed to copy', 'error');
        });
    }
    
    updateCharCount() {
        const count = this.currentPrompt.length;
        document.getElementById('charCount').textContent = count;
    }
    
    getContext() {
        return this.getDefaultContext();
    }
    
    saveContext() {
        return;
    }
    
    loadContext() {
        return;
    }
    
    saveHistory() {
        localStorage.setItem('enhancementHistory', JSON.stringify(this.history));
    }
    
    formatTimestamp(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;
        
        if (diff < 60000) return 'Just now';
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
        return date.toLocaleDateString();
    }
    
    showNotification(message, type = 'info') {
        const notification = document.getElementById('notification');
        const text = document.getElementById('notificationText');
        
        text.textContent = message;
        notification.classList.add('show');
        
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }
    
    initAnimations() {
        // Initialize text splitting for animations
        if (typeof Splitting !== 'undefined') {
            Splitting();
        }
        
        // Animate elements on load
        const fadeElements = document.querySelectorAll('.fade-in');
        fadeElements.forEach((element, index) => {
            anime({
                targets: element,
                opacity: [0, 1],
                translateY: [20, 0],
                delay: index * 200,
                duration: 800,
                easing: 'easeOutQuart'
            });
        });
        
        // Load saved context
        this.loadContext();
    }
}

// Initialize the application
let promptEnhancer;

document.addEventListener('DOMContentLoaded', () => {
    promptEnhancer = new PromptEnhancer();
});

// Global functions for inline event handlers
window.promptEnhancer = {
    restoreFromHistory: (id) => promptEnhancer?.restoreFromHistory(id),
    viewHistoryItem: (id) => promptEnhancer?.viewHistoryItem(id)
};