import { track } from '@vercel/analytics'

export interface AnalyticsEvent {
    name: string
    properties?: Record<string, any>
}

// Translation events
export const trackTranslation = (textLength: number, voiceProvider: string, success: boolean) => {
    track('translation', {
        text_length: textLength,
        voice_provider: voiceProvider,
        success,
        timestamp: new Date().toISOString()
    })
}

// Voice generation events
export const trackVoiceGeneration = (voiceId: string, provider: string, duration: number, success: boolean) => {
    track('voice_generation', {
        voice_id: voiceId,
        provider,
        duration_ms: duration,
        success,
        timestamp: new Date().toISOString()
    })
}

// User authentication events
export const trackAuth = (action: 'sign_in' | 'sign_out' | 'sign_up', provider?: string) => {
    track('auth', {
        action,
        provider,
        timestamp: new Date().toISOString()
    })
}

// User interaction events
export const trackUserInteraction = (action: string, element: string, properties?: Record<string, any>) => {
    track('user_interaction', {
        action,
        element,
        ...properties,
        timestamp: new Date().toISOString()
    })
}

// Error tracking
export const trackError = (errorType: string, errorMessage: string, context?: Record<string, any>) => {
    track('error', {
        error_type: errorType,
        error_message: errorMessage,
        ...context,
        timestamp: new Date().toISOString()
    })
}

// Performance tracking
export const trackPerformance = (metric: string, value: number, unit: string = 'ms') => {
    track('performance', {
        metric,
        value,
        unit,
        timestamp: new Date().toISOString()
    })
}

// Feature usage tracking
export const trackFeatureUsage = (feature: string, action: string, properties?: Record<string, any>) => {
    track('feature_usage', {
        feature,
        action,
        ...properties,
        timestamp: new Date().toISOString()
    })
}

// Page view tracking (for custom pages)
export const trackPageView = (page: string, properties?: Record<string, any>) => {
    track('page_view', {
        page,
        ...properties,
        timestamp: new Date().toISOString()
    })
}
