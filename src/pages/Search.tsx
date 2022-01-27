import Loader from '../components/Loader';
import React, { useRef } from 'react';
import Display from '../components/search/Display';
import { useState, useEffect, useContext} from 'react';
import { Message } from '../data/messages';
import {
    IonContent,
    IonPage,
    IonButton,
} from '@ionic/react';
import './Search.css';
import faker from 'faker';
import { MessageContext } from '../context/context';
import MobileDisplay from '../components/search/MobileDisplay';
import { useParams, useHistory } from 'react-router';
import Header from "../components/header/Header";
import { instance } from '../axios';

const Search: React.FC = () => {

    // @ts-ignore
    const { messages, setMessages, setWord } = useContext(MessageContext);
    const [total, setTotal] = useState(0);
    const [width, setWidth] = useState(window.innerWidth);
    
    window.onresize = () => {
        resizeWidth();
    };

    function resizeWidth() {
        setWidth(window.innerWidth);
    }
    
    // @ts-ignore
    const { id } = useParams();
    const [searchText, setSearchText] = useState(id);

    const [isLoading, setIsLoading] = useState(false);
    const [foundResults, setFoundResults] = useState(false);
    const [error, setError] = useState("");

    const generateLabels = () => {
        let date = new Date();
        var dates = [];
        var labels = [];
        labels.push(date.toISOString().split('T')[0]);
        dates.push(date);
        for (let i = 0; i < 9; i++) {
            let nextDay: Date = new Date(dates[i]);
            nextDay.setDate(dates[i].getDate() - 1);
            dates.push(nextDay);
            labels.push(nextDay.toISOString().split('T')[0]);
        }
        return labels.reverse();
    }
    const dispLabels = () => {
        let date = new Date();
        var dates = [];
        var labels = [];
        labels.push(date.toDateString().split(' ').slice(1).join(' '));
        dates.push(date);
        for (let i = 0; i < 9; i++) {
            let nextDay: Date = new Date(dates[i]);
            nextDay.setDate(dates[i].getDate() - 1);
            dates.push(nextDay);
            labels.push(nextDay.toDateString().split(' ').slice(1).join(' '));
        }
        return labels.reverse();
    }
    const labels = generateLabels();

    const [chartData, setChartData] = useState({
        labels: dispLabels(),
        datasets: [
            {
                type: 'line' as const,
                label: 'Line Chart',
                borderColor: 'rgb(255, 99, 132)',
                borderWidth: 2,
                fill: false,
                data: labels.map(() => faker.datatype.number({ min: -1000, max: 1000 })),
            },
            {
                type: 'bar' as const,
                label: 'Bar Graph',
                backgroundColor: 'rgb(75, 192, 192)',
                data: labels.map(() => faker.datatype.number({ min: -1000, max: 1000 })),
                borderColor: 'white',
                borderWidth: 2,
            }
        ],
    });

    const onClick = async (e: any) => {
        e.preventDefault();
        doSearch();
    }

    const doSearch = async () => {
        try {
            setIsLoading(true);
			const { data: fetchedData } = await instance.post(
				"/search/",
				{
					word: searchText,
				},
				{
					headers: {
						"Content-Type": "application/json",
					},
				}
			);

            let sample = fetchedData;
            setTotal(sample.totalCount);

            // repeated on constants.js & Search.tsx
            const numDaysBackGraphs = 10;
            var datasetForChart = Array.from({ length: numDaysBackGraphs }, () => 0);
            for (let i = 0; i < sample.ten_day_count.length; i++) {
                var labels = [];
                labels = generateLabels();
                var idx = labels.findIndex((val) => val === sample.ten_day_count[i].date);
                datasetForChart[idx + 1] = sample.ten_day_count[i].count;
            }
            setChartData({
                ...chartData,
                labels: dispLabels(),
                datasets: [
                    {
                        type: 'line' as const,
                        label: 'Line Chart',
                        borderColor: 'rgb(255, 99, 132)',
                        borderWidth: 2,
                        fill: false,
                        data: datasetForChart,
                    },
                    {
                        type: 'bar' as const,
                        label: 'Bar Graph',
                        backgroundColor: 'rgb(75, 192, 192)',
                        data: datasetForChart,
                        borderColor: 'white',
                        borderWidth: 2,
                    }
                ],
            });
            sample.messages.forEach((msg: any, idx: any) => {
                messages[idx] = {
                    message: msg.message,
                    id: idx,
                    time: msg.time,
                };
            });

            // setShowHelp(false);
            setFoundResults(true);

            let tempMsg: Message[] = [];
            sample.messages.forEach((msg: any, idx: any) => {
                let newMsg: Message = {
                    message: msg.message,
                    id: idx,
                    time: msg.time,
                }
                tempMsg.push(newMsg);
            });
            setWord(sample.word);
            setMessages(tempMsg);

            setIsLoading(false);
        } catch (e: any) {
            console.error("try/catch in Search.tsx: ", e);

            if (e && e.response) {
				setError(String(e.response.data.body));
            } else {
                setError('Unable to connect. Please try again later');
            }

            setIsLoading(false);
            setFoundResults(false);
        }
    }

    useEffect(() => {
        window.addEventListener('resize', resizeWidth);
        return () => window.removeEventListener('resize', resizeWidth);
    }, []);

    useEffect(() => {
        doSearch();
    }, [searchText]);

    const [walletAddress, setWalletAddress] = useState('');

    /**
     * Actions
     */
    const mintAddrToParent = (walletAddress: any) => {
        setWalletAddress(walletAddress);
    }

    const contentRef = useRef<HTMLIonContentElement | null>(null);
    const scrollToTop = () => {
        contentRef.current && contentRef.current.scrollToTop();
    };

    return (
        <React.Fragment>
            <IonPage id="home-page">
                <IonContent ref={contentRef} scrollEvents={true} fullscreen>

                    {/* Header */}
                    <Header mintAddrToParent={mintAddrToParent} onClick={onClick} showflag={false} />

                    {/* Main Content After Header */}
                    <div className="min-h-screen font-sans bg-gradient-to-b from-bg-primary to-bg-secondary flex justify-center items-center p-4 pt-2">

                        {/* The Gray Container */}
                        <div className={` ${width <= 640 ? "w-full" : "container"} bg-satin-3 rounded-lg pt-3 pb-6 pr-3 pl-3 h-fit xl:pb-3 2xl:pb-2 lg:pb-4`}>

                            {/* loading bar */}
                            {isLoading && (<div className="pt-10 flex justify-center items-center">
                                <Loader/>
                            </div>)}

                            {/* chart / search results, based on screen width
                                note that heights of the chart are hardcoded below, while heights of the message list is on the Display.jsx.getMessageListHeight() */}
                            {!isLoading && foundResults && width > 1536 && (
                                <Display chartData={chartData} position='bottom'
                                    height={Number(35)} total={total} totalCountHeight={18} showPie={false}
                                     width={width}/>
                            )}
                            {!isLoading && foundResults && width <= 1536 && width > 1280 && (
                                <Display chartData={chartData}  position='bottom'
                                    height={Number(45)} total={total} totalCountHeight={22} showPie={false}
                                    width={width}/>
                            )}
                            {!isLoading && foundResults && width <= 1280 && width > 1024 && (
                                <Display chartData={chartData} position='bottom'
                                    height={Number(55)} total={total} totalCountHeight={25} showPie={false}
                                    width={width}/>
                            )}
                            {!isLoading && foundResults && width <= 1024 && width > 768 && (
                                <Display chartData={chartData} position='bottom'
                                    height={Number(65)} total={total} totalCountHeight={28} showPie={false}
                                    width={width} />
                            )}
                            {!isLoading && foundResults && width <= 768 && width > 640 && (
                                <Display chartData={chartData} position='bottom'
                                    height={Number(230)} total={total} totalCountHeight={35} showPie={false}
                                    width={width} />
                            )}
                            {!isLoading && foundResults && width <= 640 && (
                                <MobileDisplay chartData={chartData} position='right'
                                    height={Number(310)} total={total} totalCountHeight={30} showPie={false}
                                 />
                            )}

                            {/* error bar */}
                            {!isLoading && !foundResults && error !== '' && (
                                <div className="relative mt-6 bg-red-100 p-6 rounded-xl">
                                    <p className="text-lg text-red-700 font-medium"><b>{error}</b></p>
                                    <span
                                        className="absolute bg-red-500 w-8 h-8 flex items-center justify-center font-bold text-green-50 rounded-full -top-2 -left-2">!</span>
                                    {/*<div className="absolute top-0 right-0 flex space-x-2 p-4"></div>*/}
                                </div>
                            )}

                            {!isLoading && foundResults && (
                                <IonButton onClick={() => scrollToTop()} className="float-right">Scroll to Top</IonButton>
                            )}

                        </div>
                    </div>

                </IonContent>
            </IonPage>
        </React.Fragment>
    );
};

export default Search;
