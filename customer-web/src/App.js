import React, {Component} from 'react';
import './App.css';
import Customer from "./components/Customer_v2";
import CustomerAdd from "./components/CustomerAdd";

import Paper from "@material-ui/core/Paper";
import Table from "@material-ui/core/Table";
import TableHead from "@material-ui/core/TableHead";
import TableBody from "@material-ui/core/TableBody";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";

import { withStyles } from "@material-ui/core/styles";
import CircularProgress from "@material-ui/core/CircularProgress";

import MenuIcon from '@material-ui/icons/Menu';
import SearchIcon from '@material-ui/icons/Search';
import InputBase from '@material-ui/core/InputBase';
import { fade } from '@material-ui/core/styles/colorManipulator';
import Typography from '@material-ui/core/Typography';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';

const styles = theme => ({
    root: {
        width: "100%",
        minWidth: 540
    },
    menu: {
        marginTop: 15,
        marginBottom: 15,
        display: 'flex',
        justifyContent: 'center'
    },
    paper: {
        marginLeft: 18,
        marginRight: 18
    },
    progress: {
        margin: theme.spacing(2)
    },
    grow: {
        flexGrow: 1,
    },
    tableHead: {
        fontSize: '1.0rem'
    },
    menuButton: {
        marginLeft: -12,
        marginRight: 20,
    },
    title: {
        display: 'none',
        [theme.breakpoints.up('sm')]: {
            display: 'block',
        },
    },
    search: {
        position: 'relative',
        borderRadius: theme.shape.borderRadius,
        backgroundColor: fade(theme.palette.common.white, 0.15),
        '&:hover': {
            backgroundColor: fade(theme.palette.common.white, 0.25),
        },
        marginLeft: 0,
        width: '100%',
        [theme.breakpoints.up('sm')]: {
            marginLeft: theme.spacing(),
            width: 'auto',
        },
    },
    searchIcon: {
        width: theme.spacing(9),
        height: '100%',
        position: 'absolute',
        pointerEvents: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    inputRoot: {
        color: 'inherit',
        width: '100%',
    },
    inputInput: {
        paddingTop: theme.spacing(),
        paddingRight: theme.spacing(),
        paddingBottom: theme.spacing(),
        paddingLeft: theme.spacing(10),
        transition: theme.transitions.create('width'),
        width: '100%',
        [theme.breakpoints.up('sm')]: {
            width: 120,
            '&:focus': {
                width: 200,
            },
        },
    }
});

class App extends Component {

    constructor(props) {
        super(props);
        this.state = {
            customers: '',
            completed: 0,
            searchKeyword: ''
        };
        this.stateRefresh = this.stateRefresh.bind(this);
        this.handleValueChange = this.handleValueChange.bind(this);
    }

    handleValueChange(e) {
        let nextState = {};
        nextState[e.target.name] = e.target.value;
        this.setState(nextState);
    }

    stateRefresh() {
        this.setState( {
            customers: '',
            completed: 0,
            searchKeyword: ''
        });
        this.callApi()
            .then(res => this.setState({customers: res.result}))
            .catch(err => console.log(err))
    }

    componentDidMount() {
        this.timer = setInterval(this.progress, 20);
        this.callApi()
            .then(res => this.setState({customers: res.result}))
            .catch(err => console.log(err));
    }

    componentWillUnmount() {
        clearInterval(this.timer);
    }

    callApi = async () => {
        const res = await fetch('http://localhost:8080/customer/list');
        return await res.json();
    };

    progress = () => {
        const {completed} = this.state;
        this.setState({completed:completed >= 100 ? 0 : completed +1});
    };

    render(){
        const { classes } = this.props;
        const cellList = ["번호", "이미지", "이름", "생일", "성별", "직업", "설정"];
        const filteredComponents = (data) => {
            data = data.filter((c) => {
               return c.name.indexOf(this.state.searchKeyword) > -1;
            });
            return data.map((c) => {
                return <Customer
                    key={c.id}
                    id={c.id}
                    image={c.image}
                    name={c.name}
                    birthday={c.birthday}
                    gender={c.gender}
                    job={c.job}
                    stateRefresh={this.stateRefresh}
                />
            });
        };
        return (
            <div className={classes.root}>
                <AppBar position="static">
                    <Toolbar>
                        <IconButton className={classes.menuButton} color="inherit" aria-label="Open drawer">
                            <MenuIcon/>
                        </IconButton>
                        <Typography className={classes.title} variant="h6" color="inherit" noWrap>
                            관리 시스템
                        </Typography>
                        <div className={classes.grow}/>
                        <div className={classes.search}>
                            <div className={classes.searchIcon}>
                                <SearchIcon/>
                            </div>
                            <InputBase
                                placeholder="검색하기"
                                classes={{root: classes.inputRoot
                                    , input: classes.inputInput}}
                                name="searchKeyword"
                                value={this.state.searchKeyword}
                                onChange={this.handleValueChange}
                            />
                        </div>
                    </Toolbar>
                </AppBar>
                <div className={classes.menu}>
                    <CustomerAdd stateRefresh={this.stateRefresh}/>
                </div>
                <Paper className={classes.paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                {cellList.map((c,i) => {
                                    return <TableCell key={i} className={classes.tableHead}>{c}</TableCell>
                                })}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {this.state.customers ? filteredComponents(this.state.customers) :
                                <TableRow>
                                    <TableCell colSpan="7" align="center">
                                        <CircularProgress className={classes.progress} variant="determinate" value={this.state.completed} />
                                    </TableCell>
                                </TableRow>
                            }
                        </TableBody>
                    </Table>
                </Paper>
            </div>
        )
    }
}

export default withStyles(styles)(App);
