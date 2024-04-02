import React, { ReactNode, useCallback, useRef, useState } from 'react';


type TTableColumn = {
  title: string;
  key: string;
  width?: number;
  dataIndex?: string;
};


type TVirtualTable = {
  columns: TTableColumn[];
  dataSource: [];
  onScroll: (e: React.UIEvent) => any;
  size: { width?: number; height: number };
  noMoreData?: boolean;
  loadingContent: string | ReactNode;
  expandable?: { render: ReactNode };
};

const DEFAULT_CELL_HEIGHT = 55;
const DEFAULT_CELL_WIDTH = 100;

const VirtualTable = (props: TVirtualTable) => {
  const { columns, dataSource, onScroll, size, noMoreData, loadingContent, expandable } = props;
  const [isBottom, setIsBottom] = useState(false);

  const [scrollState, setScrollState] = useState({ scrollLeft: 0, scrollTop: 0 });
  const virtualTableRef = useRef<HTMLDivElement>(null);
  const widthCache = useRef<{ widths: number[]; totalWidth: number }>({ totalWidth: 0, widths: [] });
  const widths = columns.map((item) => item.width || DEFAULT_CELL_WIDTH);

  const getTotalWidth = useCallback(() => {
    widthCache.current.widths = columns.reduce((pre: number[], cur, currentIndex) => {
      widthCache.current.totalWidth += cur.width || DEFAULT_CELL_WIDTH;
      pre[currentIndex] = widthCache.current.totalWidth;
      return pre;
    }, []);
    return widthCache.current.totalWidth;
  }, [widths]);

  const handleScroll = (e: React.UIEvent) => {
    const { scrollTop, scrollLeft } = e.target as HTMLDivElement;
    setScrollState({ ...{ scrollLeft, scrollTop } });
    onScroll?.(e);
  };

  const renderTitleCells = (columnCellParams: TTableColumn) => {
    return <div>{columnCellParams.title}</div>;
  };
  const renderContentCells = (rowCellContent: any, record: any) => {
    // todo: 自定义一个函数，可以把record整行的数据传出去
    return <div>{rowCellContent}</div>;
  };

  // 需要确认开头行数和结尾行数
  const renderCells = () => {
    const { scrollLeft: startWidth, scrollTop: startHeight } = scrollState;
    const containerWidth = virtualTableRef.current ? virtualTableRef.current.clientWidth : 0;
    const containerHeight = size.height;
    let startColumn;
    let endColumn;
    let startRow;
    let endRow;

    const endWidth = startWidth + containerWidth;
    const endHeight = startHeight + containerHeight;

    for (let i = 0; i < widths.length; i++) {
      if (startColumn === undefined && widths[i] > startWidth) {
        startColumn = i;
      }
      if (widths[i] >= endWidth) {
        endColumn = i;
        break;
      }
    }

    let startRowTmp = startHeight

    const cells = [];
    for (let i = Number(startColumn); i < Number(endColumn); i++) {
      const titleTmp = [];
      titleTmp.push(() => renderTitleCells(columns[i]));
      cells.push(titleTmp);
      for (let j = Number(startRow); j < Number(endRow); j++) {
        const contentTmp = [];
        contentTmp.push(() => renderContentCells(dataSource[j][columns[i].key], dataSource[j]));
        cells.push(titleTmp);
      }
    }
  };

  const totalWidth = getTotalWidth();
  return (
    <div
      ref={virtualTableRef}
      onScroll={(e) => handleScroll(e)}
      style={{ overflow: 'scroll', width: size.width || '100%', height: size.height }}
    >
      <div style={{ width: totalWidth }}></div>
    </div>
  );
};

export default VirtualTable;