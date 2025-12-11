// This file contains the FIXED onChange handlers for the bio section
// Replace lines 240-281 in WebsiteBuilder.tsx with these handlers

// FIXED: Coach Name Input onChange
onChange={e => setEditData({
    ...editData, 
    coachBio: {
        ...(editData.coachBio || { name: '', headline: '', story: '' }), 
        name: e.target.value
    }
})}

// FIXED: Headline Input onChange  
onChange={e => setEditData({
    ...editData, 
    coachBio: {
        ...(editData.coachBio || { name: '', headline: '', story: '' }), 
        headline: e.target.value
    }
})}

// FIXED: Story Textarea onChange
onChange={e => setEditData({
    ...editData, 
    coachBio: {
        ...(editData.coachBio || { name: '', headline: '', story: '' }), 
        story: e.target.value
    }
})}
