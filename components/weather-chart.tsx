import React, { useMemo } from 'react';
import { Line, LineChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Card, CardHeader, CardContent, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { CloudSun, MapPin, Calendar } from 'lucide-react';

interface WeatherDataPoint {
    date: string;
    displayDate: string;
    minTemp: number;
    maxTemp: number;
}

interface WeatherChartProps {
    result: any;
}

const WeatherChart: React.FC<WeatherChartProps> = React.memo(({ result }) => {
    const { chartData, minTemp, maxTemp } = useMemo(() => {
        const weatherData: WeatherDataPoint[] = result.list?.map((item: any) => {
            const dateObj = new Date(item.dt * 1000);
            return {
                date: dateObj.toISOString().split('T')[0], 
                displayDate: dateObj.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }),
                minTemp: Number((item.main.temp_min - 273.15).toFixed(1)),
                maxTemp: Number((item.main.temp_max - 273.15).toFixed(1)),
                weather: item.weather[0]?.main || '',
                icon: item.weather[0]?.icon || '',
            };
        });
        
        const groupedData: { [key: string]: WeatherDataPoint } = weatherData?.reduce((acc, curr) => {
            if (!acc[curr.date]) {
                acc[curr.date] = { ...curr };
            } else {
                acc[curr.date].minTemp = Math.min(acc[curr.date].minTemp, curr.minTemp);
                acc[curr.date].maxTemp = Math.max(acc[curr.date].maxTemp, curr.maxTemp);
            }
            return acc;
        }, {} as { [key: string]: WeatherDataPoint });

        const chartData = Object.values(groupedData);

        const minTemp = Math.min(...chartData.map((d) => d.minTemp));
        const maxTemp = Math.max(...chartData.map((d) => d.maxTemp));

        return { chartData, minTemp, maxTemp };
    }, [result]);

    const chartConfig: ChartConfig = useMemo(
        () => ({
            minTemp: {
                label: 'Мин. темп.',
                color: 'hsl(210, 100%, 60%)',
            },
            maxTemp: {
                label: 'Макс. темп.',
                color: 'hsl(0, 100%, 60%)',
            },
        }),
        [],
    );

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="bg-white dark:bg-neutral-800 p-3 rounded-md shadow-lg border border-neutral-200 dark:border-neutral-700">
                    <p className="font-semibold mb-1">{new Date(label).toLocaleDateString(undefined, 
                        { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    <div className="flex items-center gap-2 text-blue-500">
                        <span className="font-medium">Мин: </span>
                        <span>{payload[0].value}°C</span>
                    </div>
                    <div className="flex items-center gap-2 text-red-500">
                        <span className="font-medium">Макс: </span>
                        <span>{payload[1].value}°C</span>
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <Card className="my-4 overflow-hidden rounded-xl shadow-lg bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700">
            <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                    <CloudSun className="h-6 w-6 text-blue-500" />
                    <CardTitle className="text-neutral-800 dark:text-neutral-100">
                        Прогноз погоды для {result.city.name}
                    </CardTitle>
                </div>
                <CardDescription className="text-neutral-600 dark:text-neutral-400 flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>{result.city.name}, {result.city.country}</span>
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="w-full bg-white dark:bg-neutral-800 rounded-lg">
                    <ChartContainer config={chartConfig}>
                        <ResponsiveContainer width="100%" height={320}>
                            <LineChart data={chartData} margin={{ top: 20, right: 20, left: -10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(107, 114, 128, 0.2)" />
                                <XAxis 
                                    dataKey="date"
                                    tickFormatter={(value) => {
                                        const dateObj = new Date(value);
                                        return dateObj.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric' });
                                    }}
                                    stroke="#9CA3AF"
                                    tick={{ fill: '#6B7280', fontSize: 12 }}
                                    axisLine={{ stroke: 'rgba(156, 163, 175, 0.5)' }}
                                />
                                <YAxis
                                    domain={[Math.floor(minTemp) - 2, Math.ceil(maxTemp) + 2]}
                                    tickFormatter={(value) => `${value}°C`}
                                    stroke="#9CA3AF"
                                    tick={{ fill: '#6B7280', fontSize: 12 }}
                                    axisLine={{ stroke: 'rgba(156, 163, 175, 0.5)' }}
                                    width={55}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend 
                                    verticalAlign="top" 
                                    height={36}
                                    wrapperStyle={{ paddingTop: '10px', display: 'none' }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="minTemp"
                                    name="Мин. температура"
                                    stroke="hsl(210, 100%, 60%)"
                                    strokeWidth={3}
                                    dot={{ stroke: 'hsl(210, 100%, 60%)', strokeWidth: 2, r: 4, fill: 'white' }}
                                    activeDot={{ r: 6, stroke: 'white', strokeWidth: 2 }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="maxTemp"
                                    name="Макс. температура"
                                    stroke="hsl(0, 100%, 60%)"
                                    strokeWidth={3}
                                    dot={{ stroke: 'hsl(0, 100%, 60%)', strokeWidth: 2, r: 4, fill: 'white' }}
                                    activeDot={{ r: 6, stroke: 'white', strokeWidth: 2 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </ChartContainer>
                </div>
            </CardContent>
            <CardFooter className="border-t border-neutral-200 dark:border-neutral-700 pt-3">
                <div className="flex w-full items-center justify-between">
                    <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-neutral-500" />
                        <span className="text-neutral-600 dark:text-neutral-400">
                            Прогноз на ближайшие 5 дней
                        </span>
                    </div>
                    <div className="flex gap-4">
                        <div className="flex items-center gap-1">
                            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                            <span className="text-xs text-neutral-600 dark:text-neutral-400">Мин.</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="w-3 h-3 rounded-full bg-red-500"></div>
                            <span className="text-xs text-neutral-600 dark:text-neutral-400">Макс.</span>
                        </div>
                    </div>
                </div>
            </CardFooter>
        </Card>
    );
});

WeatherChart.displayName = 'WeatherChart';

export default WeatherChart;