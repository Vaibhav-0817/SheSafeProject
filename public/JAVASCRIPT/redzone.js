function updateTime() {
    const currentTime = new Date();
    const hours = currentTime.getHours().toString().padStart(2, '0');
    const minutes = currentTime.getMinutes().toString().padStart(2, '0');
    const seconds = currentTime.getSeconds().toString().padStart(2, '0');
    const timeString = `${hours}:${minutes}:${seconds}`;
    
    const dangerZoneStart = parseInt(document.querySelector("#dangerzonestart").textContent);
    const dangerZoneEnd = parseInt(document.querySelector("#dangerzoneend").textContent);  
    const currentHour = currentTime.getHours();
    
    const digitalClock = document.getElementById('time');
    const dangerZoneText = document.getElementById('danger-zone');
    const clockContainer = document.querySelector('.digital-clock');
    
    digitalClock.textContent = timeString;
    
    if (currentHour >= dangerZoneStart && currentHour < dangerZoneEnd) {
        clockContainer.style.backgroundColor = 'red';
        digitalClock.classList.add('danger-zone-active');
        dangerZoneText.textContent = `Red Zone: ${dangerZoneStart}:00 - ${dangerZoneEnd}:00`;
        dangerZoneText.style.display = 'block';
    } else {
        clockContainer.style.backgroundColor = '#f87696'; // Reset background color
        digitalClock.classList.remove('danger-zone-active');
        dangerZoneText.textContent = ''; // Clear the text
        dangerZoneText.style.display = 'none';
    }
}

updateTime();
setInterval(updateTime, 1000);