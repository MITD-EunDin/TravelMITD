import React, { useState, useEffect } from "react";

const RSSNews = ({ limit = Infinity }) => {
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Danh sách nguồn RSS tiếng Việt (chủ yếu là Du lịch)
    const rssSources = [
        "https://vnexpress.net/rss/du-lich.rss",
        "https://thanhnien.vn/rss/du-lich.rss",
        "https://tuoitre.vn/rss/du-lich.rss",
    ];

    const fetchRSS = async (url, retries = 3, timeout = 60000) => {
        for (let i = 0; i < retries; i++) {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), timeout);

            try {
                console.log(`Bắt đầu fetch ${url}: ${new Date().toISOString()}`);
                const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
                const response = await fetch(proxyUrl, {
                    mode: "cors",
                    signal: controller.signal,
                });
                clearTimeout(timeoutId);

                if (!response.ok) {
                    throw new Error(`Lỗi HTTP! Trạng thái: ${response.status}`);
                }

                const data = await response.json();
                const parser = new DOMParser();
                const xmlDoc = parser.parseFromString(data.contents, "text/xml");
                const items = Array.from(xmlDoc.querySelectorAll("item")).map((item) => ({
                    title: item.querySelector("title")?.textContent || "Không có tiêu đề",
                    description:
                        item.querySelector("description")?.textContent?.replace(/<[^>]+>/g, "") ||
                        "Không có mô tả",
                    link: item.querySelector("link")?.textContent || "#",
                    pubDate: item.querySelector("pubDate")?.textContent || new Date().toISOString(),
                    thumbnail:
                        item.querySelector("enclosure")?.getAttribute("url") ||
                        item.querySelector("description")?.textContent.match(/src="([^"]+)"/)?.[1] ||
                        "",
                }));
                return items;
            } catch (err) {
                console.warn(`Thử lại fetch cho ${url}. Số lần thử còn lại: ${retries - i - 1}`);
                if (i === retries - 1) {
                    throw new Error(`Không thể lấy RSS từ ${url}: ${err.message}`);
                }
            }
        }
    };

    useEffect(() => {
        const tryFetchRSS = async () => {
            setLoading(true);
            setError(null);

            try {
                // Lấy RSS từ tất cả nguồn đồng thời
                const results = await Promise.allSettled(rssSources.map((url) => fetchRSS(url)));
                const allItems = [];

                results.forEach((result, index) => {
                    if (result.status === "fulfilled") {
                        allItems.push(...result.value);
                    } else {
                        console.error(`Lỗi từ nguồn ${rssSources[index]}: ${result.reason.message}`);
                    }
                });

                // Sắp xếp theo ngày giảm dần và giới hạn số bài
                const sortedItems = allItems
                    .sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate))
                    .slice(0, limit);

                if (sortedItems.length === 0) {
                    throw new Error("Không có tin tức nào được lấy từ các nguồn RSS.");
                }

                setNews(sortedItems);
                setLoading(false);
            } catch (err) {
                setError("Không thể lấy tin tức từ các nguồn RSS. Vui lòng thử lại sau.");
                setLoading(false);
            }
        };

        tryFetchRSS();
    }, [limit]);

    if (loading) {
        return (
            <div className="text-center p-4">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Đang tải tin tức...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center p-4 text-red-500 bg-red-100 rounded-lg mx-auto max-w-screen-xl">
                <p className="font-semibold">Lỗi: {error}</p>
                <button
                    className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    onClick={() => window.location.reload()}
                >
                    Thử lại
                </button>
            </div>
        );
    }

    return (
        <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {news.map((item, index) => (
                    <div
                        key={index}
                        className="border rounded-lg p-4 bg-white shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                        onClick={() => window.open(item.link, "_blank")}
                    >
                        {item.thumbnail && (
                            <img
                                src={item.thumbnail}
                                alt={item.title}
                                className="w-full h-48 object-cover rounded-md mb-2"
                                onError={(e) => (e.target.style.display = "none")}
                            />
                        )}
                        <h3 className="text-xl font-semibold mb-2 text-gray-800">{item.title}</h3>
                        <p className="text-gray-600 mb-2">{item.description.slice(0, 150)}...</p>
                        <p className="text-sm text-gray-400">
                            {new Date(item.pubDate).toLocaleDateString("vi-VN")}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RSSNews;