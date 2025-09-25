import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	/* config options here */
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "assets.leetcode.com",
				pathname: "/**",
			},
			{
				protocol: "https",
				hostname: "aliyun-lc-upload.oss-cn-hangzhou.aliyuncs.com",
				pathname: "/**",
			},
		],
	},
};

export default nextConfig;
