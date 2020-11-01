## yh-react-virtuallist 虚拟列表组件

![build](https://github.com/yehuozhili/yh-react-virtuallist/workflows/build/badge.svg?branch=main)

-   demo: https://yehuozhili.github.io/yh-react-virtuallist/

### 制作初衷

我以前写的虚拟滚动实现的并不是很好，后来用 umihook 发现也不是很好用，它支持手动设定每个元素高度，但也不能支持不定高度，而且限定更多了，比如不能在同一个滚动 dom 下绑定多个虚拟滚动，对跨组件调用不太友好，甚至第一次出现可能不会显示，需要划一下或者使用 scrollto 才会出现。于是想自己制作个。

### 特点

-   可以自动获取高度的虚拟列表组件！
-   传入 3 个参数即可工作！

### 快速上手

-   VirtualList 是必须指定高的。SuperVirtualList 不用指定高，但需要给个估算值。

```
npm i yh-react-virtuallist
```

```tsx
import React, { useRef } from "react";
import VirtualList, { SuperVirtualList } from "yh-react-virtuallist";

const mockArr = new Array(10000).fill(1).map((x, y) => y);

export function VirtuallistDemo() {
	const ref = useRef<HTMLDivElement>(null);
	return (
		<div
			ref={ref}
			style={{
				height: "500px",
				border: "1px solid black",
				overflow: "auto",
			}}
		>
			this text in the current component
			<div>
				<VirtualList renderNumber={25} itemHeight={30} scrollDom={ref}>
					{mockArr.map((v, i) => {
						return (
							<div
								style={{
									border: "1px solid black",
									height: "30px",
								}}
								key={i}
							>
								{v}
							</div>
						);
					})}
				</VirtualList>
			</div>
		</div>
	);
}

export function SuperVirtuallistDemo() {
	const ref = useRef<HTMLDivElement>(null);
	return (
		<div
			ref={ref}
			style={{
				height: "500px",
				border: "1px solid black",
				overflow: "auto",
			}}
		>
			<div>
				<SuperVirtualList
					scrollDom={ref}
					referItemHeight={25}
					renderNumber={30}
				>
					{mockArr.map((v, i) => {
						return (
							<div
								style={{
									border: "1px solid black",
									height: `${Math.random() * 30 + 20}px`,
								}}
								key={i}
							>
								{v}
							</div>
						);
					})}
				</SuperVirtualList>
			</div>
		</div>
	);
}
```

## 参数

```tsx
export interface VirtualListProps extends AllHTMLAttributes<HTMLDivElement> {
	//滚动dom的ref
	scrollDom: RefObject<HTMLDivElement>;
	//每个元素的高度
	itemHeight: number;
	//渲染出几个元素
	renderNumber: number;
}
```

```tsx
export interface VirtualListProps extends AllHTMLAttributes<HTMLDivElement> {
	scrollDom: RefObject<HTMLDivElement>;
	referItemHeight: number; //这个是估算高度，用来一开始估算大致高度。
	renderNumber: number;
}
```
