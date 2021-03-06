import React, { Component } from 'react'

import { 
    Toast,
    NavBar,
    ListView,
    Icon,
    PullToRefresh
} from 'antd-mobile';

import messageManager from '../DataServer/MessageManager';
import userManager from '../DataServer/UserManager';

import CommentListItem from '../ViewComponent/CommentListItem';


export default class CommentScreen extends Component {



    async componentDidMount(){

        if(!userManager.isLogin()){
            this.props.history.replace('/');
            return;
        }

        const result = await messageManager.allComments(this.props.history.location.state.id)
        console.log(result)
        if(result.success === false){
            Toast.fail(result.errorMessage);
            return;
        }

        if(result.data.length === 0){
            Toast.info('无评论记录',1);
            return;
        }

        this.setState((preState)=>{
            return{
                dataSource:preState.dataSource.cloneWithRows(result.data)
            }   
        })

    }

    constructor(props) {
        super(props)

        const dataSource = new ListView.DataSource({
            rowHasChanged:(row1, row2) => row1 !== row2,
        })

        this.state = {
            dataSource,
            refreshing:false
        }
    }
    

    onRefresh = async()=>{
        try {
            this.setState({refreshing:true});
            const result = await messageManager.allComments(this.props.history.location.state.id);
            if(result.success === false){
                Toast.fail(result.errorMessage);
                this.setState({refreshing:false});
                return;
            }
            this.setState((preState)=>{
                return{
                    dataSource:preState.dataSource.cloneWithRows(result.data),
                    refreshing:false
                }   
            })
        } catch (error) {
            Toast.fail(`${error}`);
            this.setState({refreshing:false});
        }

    }
    
  render() {
    return (
      <div>
        <NavBar
            mode="dark"
            icon={<Icon type="left" />}
            onLeftClick={() => {this.props.history.goBack()}}
            rightContent={[
                <span
                    key={1}
                    onClick={()=>{
                        this.props.history.push('/CreateCommentScreen',{id:this.props.history.location.state.id});
                    }}
                >发评论</span>
            ]}
        >评论</NavBar>
        <ListView
            useBodyScroll={true}
            dataSource={this.state.dataSource}
            renderRow={(message)=>{
                return (
                    <CommentListItem 
                        {...message}
                    />
                )
            }}
            pullToRefresh={
                <PullToRefresh
                    refreshing={this.state.refreshing}
                    onRefresh={this.onRefresh}
                />
            }
        />
      </div>
    )
  }
}
