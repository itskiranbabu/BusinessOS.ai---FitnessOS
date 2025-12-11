# Duplicate Key Fix for WebsiteBuilder.tsx

## Issue
Lines 240-285 have duplicate keys in object literals causing build errors.

## Fix Required
Replace the pattern:
```javascript
coachBio: {
    name: '', 
    headline: '', 
    story: '', 
    ...(editData.coachBio || {}), 
    name: e.target.value  // DUPLICATE KEY!
}
```

With:
```javascript
coachBio: {
    ...(editData.coachBio || { name: '', headline: '', story: '' }), 
    name: e.target.value
}
```

## Locations to Fix
- Line 242-248: Coach Name input
- Line 257-263: Headline input  
- Line 275-281: Story textarea

Apply this pattern to all three onChange handlers in the bio tab section.
