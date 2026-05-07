import { createChart, CandlestickSeries } from 'lightweight-charts';
import { useEffect, useRef } from 'react';

export default function CandlestickChart({ trades }) {
    const chartRef = useRef(null);
    const chartInstance = useRef(null);

    useEffect(() => {
        if (!chartRef.current) return;

        // Create chart
        const chart = createChart(chartRef.current, {
            width: chartRef.current.clientWidth,
            height: 250,
            layout: {
                background: { color: '#050A0E' },
                textColor: '#4A7090',
            },
            grid: {
                vertLines: { color: '#0F2535' },
                horzLines: { color: '#0F2535' },
            },
            crosshair: {
                mode: 1,
            },
            rightPriceScale: {
                borderColor: '#0F2535',
            },
            timeScale: {
                borderColor: '#0F2535',
                timeVisible: true,
            },
        });

        const candleSeries = chart.addSeries(CandlestickSeries, {
            upColor: '#00FF88',
            downColor: '#FF3A5C',
            borderUpColor: '#00FF88',
            borderDownColor: '#FF3A5C',
            wickUpColor: '#00FF88',
            wickDownColor: '#FF3A5C',
        });

        // Convert trades to OHLC candles
        if (trades && trades.length > 0) {
            const candles = generateCandles(trades);
            if (candles.length > 0) {
                candleSeries.setData(candles);
            }
        } else {
            // Show placeholder candle
            const now = Math.floor(Date.now() / 1000);
            candleSeries.setData([
                { time: now - 3600, open: 0.000001, high: 0.000002, low: 0.0000008, close: 0.0000015 },
                { time: now - 1800, open: 0.0000015, high: 0.000003, low: 0.000001, close: 0.000002 },
                { time: now, open: 0.000002, high: 0.0000025, low: 0.0000018, close: 0.0000022 },
            ]);
        }

        chartInstance.current = chart;

        // Resize handler
        const handleResize = () => {
            if (chartRef.current) {
                chart.applyOptions({ width: chartRef.current.clientWidth });
            }
        };
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            chart.remove();
        };
    }, [trades]);

    return <div ref={chartRef} style={{ width: '100%' }} />;
}

function generateCandles(trades) {
    if (!trades || trades.length === 0) return [];

    // Group trades into 5-minute candles
    const candleMap = {};
    const interval = 300; // 5 minutes in seconds

    trades.forEach(trade => {
        const timestamp = Math.floor(trade.timestamp / 1000);
        const candleTime = Math.floor(timestamp / interval) * interval;
        const price = parseFloat(trade.price || 0.000001);

        if (!candleMap[candleTime]) {
            candleMap[candleTime] = {
                time: candleTime,
                open: price,
                high: price,
                low: price,
                close: price,
            };
        } else {
            const candle = candleMap[candleTime];
            candle.high = Math.max(candle.high, price);
            candle.low = Math.min(candle.low, price);
            candle.close = price;
        }
    });

    return Object.values(candleMap).sort((a, b) => a.time - b.time);
}