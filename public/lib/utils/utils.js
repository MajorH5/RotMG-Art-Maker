export const Utils = (function () {
    return {
        formatTime: (date) => {
            const now = new Date();
            const postedDate = new Date(date);
            const differenceInSeconds = Math.floor((now - postedDate) / 1000); // difference in seconds
        
            // Define time intervals in seconds
            const intervals = {
                year: 365 * 24 * 60 * 60,
                month: 30 * 24 * 60 * 60,
                week: 7 * 24 * 60 * 60,
                day: 24 * 60 * 60,
                hour: 60 * 60,
                minute: 60,
                second: 1
            };
        
            // Handle "now"
            if (differenceInSeconds < 1) {
                return "now";
            }
        
            // Check each interval
            for (const [unit, seconds] of Object.entries(intervals)) {
                const intervalCount = Math.floor(differenceInSeconds / seconds);
                if (intervalCount >= 1) {
                    return intervalCount === 1
                        ? `${intervalCount} ${unit} ago`
                        : `${intervalCount} ${unit}s ago`;
                }
            }
        }
    }
})();