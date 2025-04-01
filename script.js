// Rabbit Call - Core Functionality
document.addEventListener('DOMContentLoaded', () => {
    // Initialize Socket.IO connection
    const socket = io();
    
    // WebRTC Configuration
    const configuration = {
        iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' }
        ]
    };
    
    // DOM Elements
    const localVideo = document.getElementById('localVideo');
    const remoteVideo = document.getElementById('remoteVideo');
    const toggleScreenShareBtn = document.getElementById('toggleScreenShare');
    const toggleMicBtn = document.getElementById('toggleMic');
    const toggleCameraBtn = document.getElementById('toggleCamera');
    const endCallBtn = document.getElementById('endCall');
    const toggleMovieBtn = document.getElementById('toggleMovie');
    const toggleMusicBtn = document.getElementById('toggleMusic');
    const chatInput = document.getElementById('chatInput');
    const sendMessageBtn = document.getElementById('sendMessage');
    const chatMessages = document.getElementById('chatMessages');
    
    // Global Variables
    let localStream;
    let remoteStream;
    let peerConnection;
    let isScreenSharing = false;
    let isMicOn = true;
    let isCameraOn = true;
    let isMoviePlaying = false;
    let isMusicPlaying = false;
    
    // Authentication state
    let authState = {
        user: null
    };

    // Initialize the application
    async function init() {
        try {
            // Setup event listeners
            setupEventListeners();
            
            // Check if user is already authenticated
            checkAuthState();
            
        } catch (error) {
            console.error('Error initializing:', error);
            alert('Error initializing application. Please try again.');
        }
    }

    // Load Google Sign-In API
    function loadGoogleSignIn() {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://accounts.google.com/gsi/client';
            script.async = true;
            script.defer = true;
            script.onload = resolve;
            document.head.appendChild(script);
        });
    }

    // Initialize Google Sign-In
    function initGoogleSignIn() {
        if (window.google) {
            google.accounts.id.initialize({
                client_id: 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com',
                callback: handleGoogleSignIn
            });
            google.accounts.id.renderButton(
                document.getElementById('googleSignIn'),
                { theme: 'filled_blue', size: 'large' }
            );
        }
    }

    // Handle Google Sign-In callback
    function handleGoogleSignIn(response) {
        const user = parseJwt(response.credential);
        authState.user = user;
        localStorage.setItem('rabbitCallUser', JSON.stringify(user));
        window.location.href = 'dashboard.html';
    }

    // Parse JWT token
    function parseJwt(token) {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        return JSON.parse(atob(base64));
    }

    // Check authentication state
    function checkAuthState() {
        const user = localStorage.getItem('rabbitCallUser');
        if (user) {
            authState.user = JSON.parse(user);
            // Show admin controls if user is admin
            if (authState.user.isAdmin) {
                if (document.getElementById('adminControls')) {
                    document.getElementById('adminControls').classList.remove('hidden');
                }
                if (document.getElementById('adminCallControls')) {
                    document.getElementById('adminCallControls').classList.remove('hidden');
                }
            }
            window.location.href = 'dashboard.html';
        } else {
            initGoogleSignIn();
        }
    }

    // Handle OTP flow
    function handleOTPFlow() {
        const loginForm = document.getElementById('loginForm');
        const otpField = document.getElementById('otpField');
        const loginSubmit = document.getElementById('loginSubmit');
        const loginEmail = document.getElementById('loginEmail');

        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            if (!authState.otpSent) {
                // Send OTP
                const email = loginEmail.value;
                // In a real app, you would call your backend to send OTP
                console.log(`OTP sent to ${email}`);
                
                // Show OTP field
                otpField.classList.remove('hidden');
                loginSubmit.textContent = 'Verify OTP';
                authState.otpSent = true;
            } else {
                // Verify OTP
                const otp = document.getElementById('loginOTP').value;
                // In a real app, you would verify OTP with your backend
                console.log(`Verifying OTP: ${otp}`);
                
                // Mock verification
                // For demo purposes, make these emails admin
                const adminEmails = ['admin@rabbitcall.com', 'dallisairedddy1141@gmail.com'];
                const isAdmin = adminEmails.includes(loginEmail.value);
                authState.user = {
                    email: loginEmail.value,
                    name: loginEmail.value.split('@')[0],
                    isAdmin: isAdmin,
                    permissions: isAdmin ? ['all'] : ['call', 'chat']
                };
                localStorage.setItem('rabbitCallUser', JSON.stringify(authState.user));
                window.location.href = 'dashboard.html';
            }
        });
    }
    
    // Setup all event listeners
    function setupEventListeners() {
        // Handle OTP flow if on login page
        if (document.getElementById('loginForm')) {
            handleOTPFlow();
        }
        
        // Screen share toggle
        if (toggleScreenShareBtn) {
            toggleScreenShareBtn.addEventListener('click', toggleScreenShare);
        }
        
        // Media controls
        if (toggleMicBtn) {
            toggleMicBtn.addEventListener('click', toggleMic);
        }
        
        if (toggleCameraBtn) {
            toggleCameraBtn.addEventListener('click', toggleCamera);
        }
        
        if (endCallBtn) {
            endCallBtn.addEventListener('click', endCall);
        }
        
        if (toggleMovieBtn) {
            toggleMovieBtn.addEventListener('click', toggleMovie);
        }
        
        if (toggleMusicBtn) {
            toggleMusicBtn.addEventListener('click', toggleMusic);
        }
        
        // Chat functionality
        if (sendMessageBtn) {
            sendMessageBtn.addEventListener('click', sendMessage);
        }
        
        if (chatInput) {
            chatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') sendMessage();
            });
        }
        
        // Dashboard buttons
        if (document.getElementById('startVideoCall')) {
            document.getElementById('startVideoCall').addEventListener('click', () => {
                window.location.href = 'callroom.html?type=video';
            });
        }
        
        if (document.getElementById('startMovieSession')) {
            document.getElementById('startMovieSession').addEventListener('click', () => {
                window.location.href = 'callroom.html?type=movie';
            });
        }
        
        if (document.getElementById('startMusicSession')) {
            document.getElementById('startMusicSession').addEventListener('click', () => {
                window.location.href = 'callroom.html?type=music';
            });
        }
        
        if (document.getElementById('startScreenShare')) {
            document.getElementById('startScreenShare').addEventListener('click', () => {
                window.location.href = 'callroom.html?type=screenshare';
            });
        }
    }
    
    // Toggle screen sharing
    async function toggleScreenShare() {
        try {
            if (!isScreenSharing) {
                const screenStream = await navigator.mediaDevices.getDisplayMedia({
                    video: true,
                    audio: true
                });
                
                // Replace video track
                const videoTrack = screenStream.getVideoTracks()[0];
                const sender = peerConnection.getSenders().find(s => s.track.kind === 'video');
                sender.replaceTrack(videoTrack);
                
                // Update UI
                toggleScreenShareBtn.innerHTML = '<i class="fas fa-stop mr-2"></i> Stop Sharing';
                isScreenSharing = true;
                
                // Handle when user stops sharing
                videoTrack.onended = () => {
                    toggleScreenShare();
                };
            } else {
                // Switch back to camera
                const cameraStream = await navigator.mediaDevices.getUserMedia({
                    video: true
                });
                const videoTrack = cameraStream.getVideoTracks()[0];
                const sender = peerConnection.getSenders().find(s => s.track.kind === 'video');
                sender.replaceTrack(videoTrack);
                
                // Update UI
                toggleScreenShareBtn.innerHTML = '<i class="fas fa-share-square mr-2"></i> Share Screen';
                isScreenSharing = false;
            }
        } catch (error) {
            console.error('Error toggling screen share:', error);
        }
    }
    
    // Toggle microphone
    function toggleMic() {
        const audioTrack = localStream.getAudioTracks()[0];
        audioTrack.enabled = !audioTrack.enabled;
        isMicOn = audioTrack.enabled;
        toggleMicBtn.innerHTML = isMicOn ? '<i class="fas fa-microphone"></i>' : '<i class="fas fa-microphone-slash"></i>';
    }
    
    // Toggle camera
    function toggleCamera() {
        const videoTrack = localStream.getVideoTracks()[0];
        videoTrack.enabled = !videoTrack.enabled;
        isCameraOn = videoTrack.enabled;
        toggleCameraBtn.innerHTML = isCameraOn ? '<i class="fas fa-video"></i>' : '<i class="fas fa-video-slash"></i>';
    }
    
    // End call
    function endCall() {
        if (peerConnection) {
            peerConnection.close();
        }
        if (localStream) {
            localStream.getTracks().forEach(track => track.stop());
        }
        window.location.href = 'dashboard.html';
    }
    
    // Toggle movie playback
    function toggleMovie() {
        isMoviePlaying = !isMoviePlaying;
        toggleMovieBtn.innerHTML = isMoviePlaying ? '<i class="fas fa-pause"></i>' : '<i class="fas fa-play"></i>';
        // In a real app, this would sync with other participants via Socket.IO
    }
    
    // Toggle music playback
    function toggleMusic() {
        isMusicPlaying = !isMusicPlaying;
        toggleMusicBtn.innerHTML = isMusicPlaying ? '<i class="fas fa-pause"></i>' : '<i class="fas fa-play"></i>';
        // In a real app, this would sync with other participants via Socket.IO
    }
    
    // Send chat message
    function sendMessage() {
        const message = chatInput.value.trim();
        if (message) {
            // In a real app, this would send via Socket.IO
            const messageElement = document.createElement('div');
            messageElement.className = 'bg-gray-700 p-2 rounded-lg';
            messageElement.textContent = `You: ${message}`;
            chatMessages.appendChild(messageElement);
            chatInput.value = '';
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
    }
    
    // Populate friends list (mock data)
    function populateFriendsList() {
        const friendsList = document.getElementById('friendsList');
        const friends = [
            { name: 'Ash Ketchum', online: true },
            { name: 'Misty', online: true },
            { name: 'Brock', online: false },
            { name: 'Pikachu', online: true }
        ];
        
        friends.forEach(friend => {
            const friendElement = document.createElement('div');
            friendElement.className = `flex items-center p-2 rounded-lg cursor-pointer friend-item ${friend.online ? 'bg-green-100' : 'bg-gray-100'}`;
            friendElement.innerHTML = `
                <div class="w-3 h-3 rounded-full ${friend.online ? 'bg-green-500' : 'bg-gray-500'} mr-2"></div>
                <span>${friend.name}</span>
            `;
            friendsList.appendChild(friendElement);
        });
    }
    
    // Initialize WebRTC connection
    async function createPeerConnection() {
        peerConnection = new RTCPeerConnection(configuration);
        
        // Add local stream to connection
        localStream.getTracks().forEach(track => {
            peerConnection.addTrack(track, localStream);
        });
        
        // When remote stream arrives, show it in remote video element
        peerConnection.ontrack = event => {
            remoteStream = event.streams[0];
            remoteVideo.srcObject = remoteStream;
        };
        
        // ICE candidate handling
        peerConnection.onicecandidate = event => {
            if (event.candidate) {
                socket.emit('candidate', event.candidate);
            }
        };
        
        // Create offer
        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);
        socket.emit('offer', offer);
    }
    
    // Socket.IO event handlers
    socket.on('offer', async offer => {
        if (!peerConnection) {
            await createPeerConnection();
        }
        
        await peerConnection.setRemoteDescription(offer);
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);
        socket.emit('answer', answer);
    });
    
    socket.on('answer', async answer => {
        await peerConnection.setRemoteDescription(answer);
    });
    
    socket.on('candidate', async candidate => {
        try {
            await peerConnection.addIceCandidate(candidate);
        } catch (error) {
            console.error('Error adding ICE candidate:', error);
        }
    });
    
    // Start the application
    init();
});