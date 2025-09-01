document.addEventListener('DOMContentLoaded', () => {
    const modeSwitch = document.getElementById('mode-switch-checkbox');
    const body = document.body;

    // 1. Check for saved mode in localStorage and apply it
    const savedMode = localStorage.getItem('aria-mode');
    if (savedMode === 'challenger') {
        body.classList.add('challenger-mode');
        if(modeSwitch) modeSwitch.checked = true;
    } else {
        body.classList.remove('challenger-mode');
        if(modeSwitch) modeSwitch.checked = false;
    }

    // 2. Add event listener for the switch
    if (modeSwitch) {
        modeSwitch.addEventListener('change', () => {
            if (modeSwitch.checked) {
                // Switch to Challenger Mode
                body.classList.add('challenger-mode');
                localStorage.setItem('aria-mode', 'challenger');
            } else {
                // Switch to Tuner Mode
                body.classList.remove('challenger-mode');
                localStorage.setItem('aria-mode', 'tuner');
            }
        });
    }
});