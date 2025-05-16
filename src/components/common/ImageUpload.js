import React, { useState } from 'react';

const ImageUpload = () => {
    const [imageUrl, setImageUrl] = useState('');

    const handleUpload = async (event) => {
        const file = event.target.files[0];
        const formData = new FormData();

        formData.append('file', file);
        formData.append('upload_preset', 'image tour'); // nhớ đổi tên này nha

        const res = await fetch('https://api.cloudinary.com/v1_1/duydoyrpb/image/upload', {
            method: 'POST',
            body: formData,
        });

        const data = await res.json();
        console.log('Ảnh đã upload:', data.secure_url);
        setImageUrl(data.secure_url); // Lưu lại URL cho việc khác
    };

    return (
        <div>
            <input type="file" onChange={handleUpload} />
            {imageUrl && (
                <div>
                    <p>Ảnh preview nè:</p>
                    <img src={imageUrl} alt="Uploaded" width="300" />
                </div>
            )}
        </div>
    );
};

export default ImageUpload;
