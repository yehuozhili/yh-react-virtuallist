import React, {
	AllHTMLAttributes,
	PropsWithChildren,
	ReactElement,
	RefObject,
	useEffect,
	useLayoutEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import { unstable_batchedUpdates } from "react-dom";

function arrayResolve<R>(
	value: any,
	isArrayFunc: Function,
	notArrayFunc: Function
): R {
	if (Array.isArray(value)) {
		return isArrayFunc(value);
	} else {
		console.error("you must pass array children ");
		return notArrayFunc();
	}
}

export interface VirtualListProps extends AllHTMLAttributes<HTMLDivElement> {
	scrollDom: RefObject<HTMLDivElement>;
	referItemHeight: number;
	renderNumber: number;
}

export function VirtualList(props: PropsWithChildren<VirtualListProps>) {
	const {
		scrollDom,
		referItemHeight,
		renderNumber,
		children,
		...rest
	} = props;

	const [scrollDomParams, setScrollDomParams] = useState({
		width: 0,
		height: 0,
		top: 0,
		left: 0,
	});

	useEffect(() => {
		if (props.scrollDom.current) {
			const rect = props.scrollDom.current.getBoundingClientRect();
			setScrollDomParams({
				width: rect.width,
				height: rect.height,
				left: rect.left,
				top: rect.top,
			});
		}
	}, [props.scrollDom]);

	const [childrenWrapParams, setChildrenWrapParams] = useState({
		width: 0,
		height: 0,
		top: 0,
		left: 0,
	});

	const ref = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (ref.current) {
			const rect = ref.current.getBoundingClientRect();
			setChildrenWrapParams({
				width: rect.width,
				height: rect.height,
				left: rect.left,
				top: rect.top,
			});
		}
	}, []);

	const wrapperToScrollDomDistance = useMemo(() => {
		return childrenWrapParams.top - scrollDomParams.top;
	}, [childrenWrapParams.top, scrollDomParams.top]);

	//为每个元素建立高度
	const cache = useMemo(() => {
		return arrayResolve<Record<number, number>>(
			props.children,
			(val: any[]) => {
				return val.reduce((prev, next, index) => {
					prev[index] = props.referItemHeight;
					return prev;
				}, {});
			},
			() => {}
		);
	}, [props.children, props.referItemHeight]);

	const [mockHeight, setMockHeight] = useState(() => {
		return Object.values(cache).reduce((prev, next) => prev + next, 0);
	});
	useEffect(() => {
		setMockHeight(
			Object.values(cache).reduce((prev, next) => prev + next, 0) -
				scrollDomParams.height
		);
	}, [cache, scrollDomParams.height]);

	const refData: Record<number, HTMLDivElement> = useMemo(() => {
		return {};
	}, []);

	const cloneChildren = useMemo(() => {
		return arrayResolve<ReactElement[]>(
			props.children,
			(val: ReactElement[]) => {
				return val.map((v, i) => {
					const oprops = v.props;
					return React.cloneElement(v, {
						...oprops,
						ref: (node: HTMLDivElement) => {
							refData[i] = node;
						},
					});
				});
			},
			() => []
		);
	}, [props.children, refData]);

	const [renderChildren, setRenderChildren] = useState(
		//一开始，需要返回对应截取的元素
		() => {
			return arrayResolve<ReactElement[]>(
				cloneChildren,
				(val: any[]) => val.slice(0, props.renderNumber),
				() => []
			);
		}
	);

	//初次返回，我们进行修正cache //初次渲染 0- props.renderNumber
	useLayoutEffect(() => {
		if (
			//如果0存在，说明已经显示了，
			refData[0]
		) {
			//map rendernumber
			new Array(props.renderNumber).fill(1).forEach((x, y) => {
				if (refData[y]) {
					const height =
						refData[y].getBoundingClientRect().height || cache[y];
					cache[y] = height;
				}
			});
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const [viewPortY, setViewPortY] = useState(0);

	const current = useMemo(() => {
		return {
			//以start为界。每次删除前面的，加入后面的，并且修正cache
			start: props.renderNumber,
		};
	}, [props.renderNumber]);

	const maxY = useMemo(() => {
		//最大值等于mock高减去一屏幕高度
		return mockHeight - scrollDomParams.height - scrollDomParams.height;
	}, [mockHeight, scrollDomParams.height]);
	useEffect(() => {
		let fn: (e: Event) => void;
		let timer: number;
		if (props.scrollDom.current) {
			fn = (e: Event) => {
				const target = e.target as HTMLDivElement;
				const scroll = target.scrollTop - scrollDomParams.height;
				//根据scroll的高度判断滚到第几个位置
				let sum = 0;
				let sindex = 0;
				Object.values(cache).some((v, i) => {
					sum = sum + v;
					if (sum > scroll) {
						sindex = i + 1; //除非一个元素占一屏幕，否则一般不会有bug
						return true;
					}
					return false;
				});

				const remain =
					props.renderNumber + sindex + props.renderNumber >
					cloneChildren.length
						? cloneChildren.length
						: props.renderNumber + props.renderNumber + sindex;

				const start = current.start;
				if (start < remain && start < cloneChildren.length) {
					timer = window.setTimeout(() => {
						for (let i = start; i < remain; i++) {
							if (refData[i]) {
								const height =
									refData[i].getBoundingClientRect().height ||
									cache[i];
								cache[i] = height;
							}
						}
						setMockHeight(
							Object.values(cache).reduce(
								(prev, next) => prev + next,
								0
							) - scrollDomParams.height
						);
						current.start = remain;
						//删除start之前的dom
						for (let i = 0; i < start; i++) {
							if (refData[i]) {
								delete refData[i];
							}
						}
					});
				}
				//减去一屏幕高度
				let Y =
					scroll -
					wrapperToScrollDomDistance -
					scrollDomParams.height;
				if (Y < 0) {
					Y = 0;
					//最后的scroll 需要减去一屏幕高度
				} else if (Y >= maxY) {
					Y = maxY;
				}
				unstable_batchedUpdates(() => {
					setRenderChildren(cloneChildren.slice(0 + sindex, remain));
					setViewPortY(Y);
				});
			};

			props.scrollDom.current.addEventListener("scroll", fn);
		}
		return () => {
			if (props.scrollDom.current) {
				//解绑非常重要，否则渲再次出现渲染会出严重问题
				props.scrollDom.current.removeEventListener("scroll", fn);
			}
			window.clearTimeout(timer);
		};
	}, [
		cache,
		cloneChildren,
		current,
		maxY,
		props.referItemHeight,
		props.renderNumber,
		props.scrollDom,
		refData,
		scrollDomParams.height,
		wrapperToScrollDomDistance,
	]);

	return (
		<div
			className="yh-supervirtuallist"
			style={{ display: "flex", position: "relative", width: "100%" }}
			{...rest}
		>
			<div style={{ height: mockHeight }}></div>
			<div
				ref={ref}
				style={{
					position: "absolute",
					transform: `translate3d(0px, ${viewPortY}px, 0px)`,
					width: "100%",
				}}
			>
				{renderChildren}
			</div>
		</div>
	);
}

export default VirtualList;
