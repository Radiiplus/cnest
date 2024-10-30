const { JSDOM } = require('jsdom');
const DOMPurify = require('dompurify');

class DynamicValidator {
    constructor(config = {}) {
        this.useJsdom = config.useJsdom || false;
        this.useDomPurify = config.useDomPurify || false;
        this.validateWhitespace = config.validateWhitespace || false;
        this.removeEmojis = config.removeEmojis || false;
        this.wrapXSS = config.wrapXSS || false; 

        if (this.useJsdom) {
            this.window = new JSDOM('').window;
        }
        if (this.useDomPurify && this.useJsdom) {
            this.purify = DOMPurify(this.window);
        } else if (this.useDomPurify && !this.useJsdom) {
            throw new Error('DOMPurify requires jsdom to be enabled');
        }
    }

    removeEmojiChars(message) {
        return this.removeEmojis 
            ? message.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}]/gu, '') 
            : message;
    }

    wrapXSSCharacters(message) {
    if (!this.wrapXSS) return message;
    
    const alphanumeric = /[a-zA-Z0-9]/;
    const chunks = [];
    let lastIndex = 0;
    const len = message.length;
    
    for (let i = 0; i < len; i++) {
        if (!alphanumeric.test(message[i])) {
            if (i > lastIndex) {
                chunks.push(message.slice(lastIndex, i));
            }
            chunks.push(`•%•${message[i]}•%•`);
            lastIndex = i + 1;
        }
    }
    
    if (lastIndex < len) {
        chunks.push(message.slice(lastIndex));
    }
    
    return chunks.join('');
}
    sanitizeMessage(message) {
        let sanitizedMessage = message;

        if (this.validateWhitespace) {
            sanitizedMessage = sanitizedMessage.trim();
            if (!sanitizedMessage) throw new Error('Message is empty or contains only whitespace');
        }

        if (this.useDomPurify) {
            sanitizedMessage = this.purify.sanitize(sanitizedMessage, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
        }

        sanitizedMessage = this.wrapXSSCharacters(sanitizedMessage);
        return this.removeEmojiChars(sanitizedMessage);
    }

    applyCss(container) {
        if (this.cssConfig && typeof this.cssConfig === 'object') {
            Object.assign(container.style, this.cssConfig);
        }
    }
}

module.exports = DynamicValidator;