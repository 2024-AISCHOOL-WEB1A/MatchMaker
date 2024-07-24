document.getElementById("imageUpload").addEventListener("change", function(event) {
    const file = event.target.files[0];
    const formData = new FormData();
    formData.append('profileImage', file);

    fetch('/upload', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        document.getElementById('profileImage').src = data.imageUrl;
    })
    .catch(error => {
        console.error('Error:', error);
    });
});