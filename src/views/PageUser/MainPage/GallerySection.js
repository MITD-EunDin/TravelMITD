import React from 'react';
import 'swiper/css';
import 'swiper/css/navigation';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Thumbs } from 'swiper/modules';

import image1 from '../../../assets/image/image1.jpg';
import image2 from '../../../assets/image/image2.jpg';
import image3 from '../../../assets/image/image3.jpg';
import image4 from '../../../assets/image/image4.jpg';
import image5 from '../../../assets/image/image5.jpg';

const imageList = [image1, image2, image3, image4, image5];

const GallerySection = () => {
    return (
        <div className="gallery-index w-full max-w-screen-xl mx-auto py-8">
            <div className="header__section mb-4 text-center">
                <h2 className="text-3xl font-bold uppercase">Hình ảnh ấn tượng</h2>
            </div>

            {/* Flex container chia layout 3/4 - 1/4 */}
            <div className="flex gap-4 h-[500px]">
                {/* Swiper chính - 3/4 */}
                <div className="w-3/4">
                    <Swiper
                        modules={[Navigation, Thumbs]}
                        navigation
                        spaceBetween={10}
                        slidesPerView={1}
                        className="gallery-main mb-4 h-full"
                    >
                        {imageList.map((src, index) => (
                            <SwiperSlide key={index}>
                                <img
                                    src={src}
                                    alt={`slide-${index}`}
                                    className="w-full h-full object-cover rounded-lg"
                                />
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </div>

                {/* Swiper thumbnails - 1/4, chiều dọc */}
                <div className="w-1/4 overflow-hidden">
                    <Swiper
                        direction="vertical"
                        modules={[Navigation, Thumbs]}
                        spaceBetween={10}
                        slidesPerView={4}
                        className="gallery-thumbs h-full"
                    >
                        {imageList.map((src, index) => (
                            <SwiperSlide key={index}>
                                <img
                                    src={src}
                                    alt={`thumb-${index}`}
                                    className="w-full h-[120px] object-cover rounded-md border"
                                />
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </div>
            </div>
        </div>
    );
};

export default GallerySection;
