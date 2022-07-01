import React, {useEffect, useState} from 'react';
import { instance } from '../../axios';
import { AppComponentProps } from '../../components/Route';
import { IonButton, IonGrid, IonRow, IonCol, IonCard,  IonText, IonCheckbox, useIonToast,} from '@ionic/react';
import './ManageServer.scss';
import { useHistory, useParams } from 'react-router';
import Loader from '../../components/Loader';
import './SeamlessDetail.scss';
import discordImage from '../../images/discord.png';
import twitterImage from '../../images/twitter.png';
import { useQuery } from 'react-query';
import { setMultipleList } from '../../redux/slices/whitelistSlice';
import { useDispatch } from 'react-redux';

/**
 * The page they see when they click "Initiate Seamless"
 *
 * This lists all of the discords we have. User has to click into one to proceed
 */

interface selcetServer{
    id: string
    name: string
     discordGuildId:string
    }

const SeamlessDetail: React.FC<AppComponentProps> = () => {
    let history = useHistory();
    const dispatch = useDispatch()
    const [present] = useIonToast();
    const { serverId } = useParams<any>();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [serverList, setServerList] = useState<any>([]);
    const [multipleflag, setmultipleflag] = useState<boolean>(false)
    const [selectMultipleWhiteList, setSelectMultipleWhiteList] = useState<selcetServer[]>([])

    // this loads up all the discords etc
    const { data: servers = [] } = useQuery<any>(  ['allServers'],
        async () => {
            setIsLoading(true)
            const { data: { guilds },  } = await instance.get('/getAllGuildsData');
            let tmpServerArr = []
            setIsLoading(false)
            for(let i=0; i<guilds.length;i++){
                if(guilds[i].id !== serverId ){
                    tmpServerArr.push(guilds[i])
                }
            }
            setServerList(tmpServerArr);
            return guilds;
        }
    );

    return (
        <>
            <IonGrid>
                <IonRow>
                    <IonCol size="12">
                    <div className='flex flex-row justify-between items-center'>
                            <div className='w-4/5'>
                                <h2 className="ion-no-margin font-bold text-xl"> Seamless - select a DAO</h2>
                        <p className='ion-no-margin'>
                            A new way to Request a collaboration with one of our partnered servers - select the server you wish to collaborate with in list below, and fill out the collaboration form on the next page.
                            <br/>
                            Please make sure that you invited the correct SOL Decoder Bot to your server! You must use the SECOND link when on the <a href="https://soldecoder.app/manageserver" className="underline cursor-pointer">Select a Server</a> page
                        </p>

                            </div>
                            {!multipleflag &&  
                            <div className={`seamless-tab-btn-active w-40 h-10`} onClick={()=> setmultipleflag((n)=>!n)}>
                            Select Multiple
                            </div>
                            }
                            {/*  */}
                            {multipleflag &&  
                            <div className='flex justify-between ml-2'>
                            <div className={`seamless-tab-btn-active w-32 h-10 mr-2`} onClick={()=> {
                                setSelectMultipleWhiteList([])
                                setmultipleflag((n)=>!n)
                            }}>
                            cancel
                            </div>
                            <div className={`seamless-tab-btn-active w-32 h-10`} onClick={()=> {
                                if(selectMultipleWhiteList.length===0){
                                    present({
                                        message: 'Please Select Atleast 1 server',
                                        color: 'danger',
                                        duration: 10000,
                                    });
                                    return
                                }
                                dispatch(setMultipleList(selectMultipleWhiteList))
                                history.push({pathname:`/add_multiple_white_list`,state:serverId})
                                setSelectMultipleWhiteList([])
                                setmultipleflag((n)=>!n)
                                // history.push('/add_multiple_white_list')

                                // setmultipleflag((n)=>!n)
                            }}>
                            Submit
                            </div>
                            </div>
                            }
                        </div>
                    </IonCol>

                    <IonCol ize-xl="12" size-md="12" size-sm="12" size-xs="12"></IonCol>

                    {/*<IonCol ize-xl="12" size-md="12" size-sm="12" size-xs="12">*/}
                    {/*    <div className='font-bold text-xl'>Select a DAO to give whitelists to</div>*/}
                    {/*</IonCol>*/}

                        <>
                            {isLoading ? <Loader/> :
                            <>
                                {serverList && serverList.map((server: any,index:number)=>{
                                    return(
                                        <IonCol size-xl="4" size-md="6" size-sm="6" size-xs="12" key={index} >
                                            <IonCard className='ion-no-margin'>

                                                <div className="cardImage relative">

                                                    {/* image */}
                                                    <img src={server?.image} className={server?.image ? 'cardMainImage' : 'cardNoImage'}  alt='' />

                                                    <div className="cardOverlay-content py-1 px-4">

                                                        <div className='text-lg font-bold'>{server?.name}</div>

                                                        <div className="socialMediaIcon">

                                                            {/*discord*/}
                                                            <img hidden={!server?.discord_link} src={discordImage} style={{ height: '18px' }} className='cursor-pointer' onClick={(event)=>{
                                                                event.stopPropagation();
                                                                if(server.discord_link){
                                                                    window.open(server?.discord_link)
                                                                }}} />

                                                            {/*twitter*/}
                                                            <img hidden={!server?.twitter_link} src={twitterImage} style={{ height: '18px' }} className='cursor-pointer' onClick={(event)=>{
                                                                event.stopPropagation();
                                                                if(server.twitter_link){
                                                                    window.open(server?.twitter_link)
                                                                }}} />
                                                        </div>
                                                    </div>
                                                </div>

                                                <IonGrid className="py-4 px-4">
                                                    <div className='text-white'>{server?.description}</div>

                                                    <IonRow hidden={!server?.twitter_followers}>
                                                        <IonCol size="8">
                                                            <IonText className='text-white'>Twitter Followers</IonText>
                                                        </IonCol>
                                                        <IonCol size="4" className="ion-text-end">
                                                            <IonText className="greenText">{server?.twitter_followers || 0 } </IonText>
                                                        </IonCol>
                                                    </IonRow>
                                                    <IonRow hidden={!server?.twitter_interactions}>
                                                        <IonCol size="8">
                                                            <IonText className='text-white'>Twitter Interaction</IonText>
                                                        </IonCol>
                                                        <IonCol size="4" className="ion-text-end">
                                                            <IonText className="BlueText">{server?.twitter_interactions || 0}</IonText>
                                                        </IonCol>
                                                    </IonRow>
                                                    <div className="content-extra-space"></div>

                                                    <IonRow hidden={!server?.discord_members}>
                                                        <IonCol size="8">
                                                            <IonText className='text-white'>Discord Members</IonText>
                                                        </IonCol>
                                                        <IonCol size="4" className="ion-text-end">
                                                            <IonText className="greenText">{server?.discord_members || 0}</IonText>
                                                        </IonCol>
                                                    </IonRow>
                                                    <IonRow hidden={!server?.discord_online}>
                                                        <IonCol size="8">
                                                            <IonText className='text-white'>Online</IonText>
                                                        </IonCol>
                                                        <IonCol size="4" className="ion-text-end">
                                                            <IonText className="BlueText">{server?.discord_online || 0}</IonText>
                                                        </IonCol>
                                                    </IonRow>
                                                    <IonRow>
                                                        <IonCol size="12">
                                                            <IonButton className="cardButton w-full" onClick={(event) => {
                                                                event.stopPropagation()
                                                                history.push({pathname:`/seamlessdetail/${serverId}`,state:server})} }>
                                                                Initiate Seamless
                                                            </IonButton>
                                                        </IonCol>
                                                        </IonRow>
                                                        <IonRow>
                                                        {multipleflag && <IonCheckbox   onIonChange={e => {
                                                            if(e.detail.checked){
                                                                setSelectMultipleWhiteList(old=>[...old,{id:server.id,name:server.name,discordGuildId:server.discordGuildId}])
                                                            }else{
                                                                setSelectMultipleWhiteList(old=>old.filter(data=>data.id!==server.id))
                                                            }
                                                        }} />}
                                                            
                                                    </IonRow>
                                                </IonGrid>
                                            </IonCard>
                                        </IonCol>
                                    )
                                })}
                            </>}
                        </>
                </IonRow>
            </IonGrid>
        </>
    );
};
// @ts-ignore
export default SeamlessDetail;
