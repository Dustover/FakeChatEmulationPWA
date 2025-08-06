function getMessageTimestamp(selectedValue, customTimeValue) {
    const now = new Date();
    if (selectedValue === 'now') {
        return now.toISOString();
    } else if (selectedValue === '5min') {
        return new Date(now.getTime() - 5 * 60000).toISOString();
    } else if (selectedValue === '1h') {
        return new Date(now.getTime() - 60 * 60000).toISOString();
    } else if (selectedValue === 'custom') {
        if (customTimeValue) {
            // customTimeValue в формате YYYY-MM-DDTHH:MM
            const dt = new Date(customTimeValue);
            if (!isNaN(dt)) return dt.toISOString();
        }
        return now.toISOString();
    } else {
        return now.toISOString();
    }
}
