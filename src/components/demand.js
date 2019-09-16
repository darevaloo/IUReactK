import React, {Component} from 'react';
import { ResponsiveStream } from '@nivo/stream'
import { ResponsiveLine } from '@nivo/line';
import Card  from 'react-bootstrap/Card';
import Button  from 'react-bootstrap/Button';
import Table from 'react-bootstrap/Table';
import Modal from 'react-bootstrap/Modal';
import axios from 'axios';
import './demand.css';
import {ic_delete} from 'react-icons-kit/md/ic_delete'
import { Icon } from 'react-icons-kit'


axios.defaults.headers.post['Content-Type'] ='application/json';



function parser_stream(curves_plot){
  var data = [];
  var i = 0;
  for (var j = 0; j < 15; j++) {
   data.push({});
  };
  Object.keys(curves_plot).forEach(function(key){
    Object.keys(curves_plot[key]).forEach(function(k){
      i = 0;
      curves_plot[key][k]["DEMAND_HIGH"].forEach(function(node){
        data[i][k]=node;
        i = i +1;
      });
    });
  });
  return data;
}

function parser_plot(curves_plot){
  var data = [];
  Object.keys(curves_plot).forEach(function(key){
    Object.keys(curves_plot[key]).forEach(function(k){
      var curve = {}
      curve["id"] = k;
      var points = [];
      var i = 0;
      curves_plot[key][k]["PRICE"].forEach(function(node){
        points.push({"x":i,"y":node});
        i = i +1;
      });
      curve["data"]= points;
      data.push(curve)
    });
  });
  return data;
};



class SelectCurve extends Component{

  constructor() {
      super();
      this.state = {
        data: {},
        show: false
      };
      // Este enlace es necesario para hacer que `this` funcione en el callback
      this.handleClick = this.handleClick.bind(this);
      this.handleSave = this.handleSave.bind(this);
      this.clickSpan = this.clickSpan.bind(this);

    }
   clickSpan= (e) =>{
     console.log(e.target.id);
   }
   handleClose = () => {
       this.setState(state => ({
         show: false
       }));
   }
   handleShow = () => {
       this.setState(state => ({
         show: true
       }));
   }
   handleSave = () =>{
     var data = this.state.data;
     this.props.callbackFromParent(data);
     this.setState(state => ({
       show: false
     }));
   }
   handleClick= (e) =>{
      //props.callbackFromParent();
      var curves = this.state.data;
      if (e.target.checked){
        var keys = e.target.value.split("/");
        var data = this.props.curves_list;
        keys.forEach(k=>{
          data = data[k]
        });
        curves[e.target.value] = data;
        this.setState(state => ({
          data: curves
        }));
      } else {
        delete curves[e.target.name]
        this.setState(state => ({
          data: curves
        }));
      }

  }

  treeOption(data,cadena,deep){
    if ((deep <= 2)){
      return (<ul className="nested" >{Object.keys(data).map(key=>
                <li >
                   {deep === 2 ? <tr><td><input type="radio" name="curve" onChange={this.handleClick} value={cadena.concat(key)}/><label>&nbsp;{key}</label></td></tr>:<span className="caret" onClick={this.clickSpan} id={key}>{key}</span>}
                   {this.treeOption(data[key],cadena.concat(key,'/'),deep+1)}
                </li>
                  )
                }
              </ul>
            )
    }
}


  render() {
    return (
    <div>
      <Button variant="outline-secondary" onClick={this.handleShow}>
        Adicionar curva
      </Button>

      <Modal show={this.state.show} onHide={this.handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Adicionar curva</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            <table>
            <tr>
              <th>
                Curva
              </th>
            </tr>

            {this.treeOption(this.props.curves_list,'',0)}

            </table>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={this.handleClose}>
            Cerrar
          </Button>
          <Button variant="primary" onClick={this.handleSave}>
            Guardar
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
}

class Demanda extends Component{

    constructor() {
        super();
        this.state = {
          data: [],
          curves_list: {},
          curves_plot: {},
          curves_stream: [],
          isToggleOn: true
        }
        // Este enlace es necesario para hacer que `this` funcione en el callback
        this.handleClick = this.handleClick.bind(this);
        this.myCallback = this.myCallback.bind(this);
        this.clickDelete = this.clickDelete.bind(this);
      }

      componentDidMount() {
          var curveList = this.state.curves_list;

          axios.get("http://167.99.13.15/latest_data/demanda_por_Cedis/")
          .then(response =>{
            curveList = response.data;
            this.setState(state=>({
                curves_list: curveList
            }));

          })
          .catch(error => {
            console.log(error);
          });




  }



  myCallback = (dataFromChild) => {
      console.log(parser_stream(dataFromChild));
      this.setState(state => ({
        curves_plot: dataFromChild,
        data: parser_plot(dataFromChild),
        curves_stream : parser_stream(dataFromChild),
        isToggleOn: !state.isToggleOn
      }));
  }

  clickDelete(e){
    var curvesPlot = this.state.curves_plot;
    delete curvesPlot[e.target.value];
    var curvesStream = [];

    this.setState(state => ({
      curves_plot: curvesPlot,
      curves_stream:curvesStream,
      data: parser_plot(curvesPlot)
    }));
  }



  handleClick() {
    this.setState(state => ({
      isToggleOn: !state.isToggleOn
    }));
  }

  render(){
    return (

      <div className="content">

            <div className="graph-production">
                <h3>Demanda Estimada</h3>
                <ResponsiveStream
                        data={this.state.curves_stream}
                        keys={[ 'BASELINE', 'E1', 'E2', 'E3' ]}
                        margin={{ top: 50, right: 110, bottom: 50, left: 60 }}
                        axisTop={null}
                        axisRight={null}
                        axisBottom={{
                            orient: 'bottom',
                            tickSize: 5,
                            tickPadding: 5,
                            tickRotation: 0,
                            legend: '',
                            legendOffset: 36
                        }}
                        axisLeft={{ orient: 'left', tickSize: 5, tickPadding: 5, tickRotation: 0, legend: '', legendOffset: -40 }}
                        curve="linear"
                        offsetType="none"
                        colors={{ scheme: 'nivo' }}
                        fillOpacity={0.85}
                        borderColor={{ theme: 'background' }}
                        defs={[
                            {
                                id: 'dots',
                                type: 'patternDots',
                                background: 'inherit',
                                color: '#2c998f',
                                size: 4,
                                padding: 2,
                                stagger: true
                            },
                            {
                                id: 'squares',
                                type: 'patternSquares',
                                background: 'inherit',
                                color: '#e4c912',
                                size: 6,
                                padding: 2,
                                stagger: true
                            }
                        ]}
                        fill={[
                            {
                                match: {
                                    id: 'Paul'
                                },
                                id: 'dots'
                            },
                            {
                                match: {
                                    id: 'Marcel'
                                },
                                id: 'squares'
                            }
                        ]}
                        dotSize={8}
                        dotColor={{ from: 'color' }}
                        dotBorderWidth={2}
                        dotBorderColor={{ from: 'color', modifiers: [ [ 'darker', 0.7 ] ] }}
                        animate={true}
                        motionStiffness={90}
                        motionDamping={15}
                        legends={[
                            {
                                anchor: 'bottom-right',
                                direction: 'column',
                                translateX: 100,
                                itemWidth: 80,
                                itemHeight: 20,
                                itemTextColor: '#999999',
                                symbolSize: 12,
                                symbolShape: 'circle',
                                effects: [
                                    {
                                        on: 'hover',
                                        style: {
                                            itemTextColor: '#000000'
                                        }
                                    }
                                ]
                            }
                        ]}
                    />



            </div>
            <div className="curve-add">
                <Card  border="light" style={{ width: '20rem' }}>
                    <Card.Body>
                        <Card.Title>Curvas Activas</Card.Title>

                            <Card.Text>
                                <Table fill>
                                 <tbody>
                                    <tr key="1">
                                        <th> Nombre curva</th>
                                        <th>  </th>
                                    </tr>
                                    {Object.keys(this.state.curves_plot).map(key=>
                                      <tr key={key}>
                                          <td> {key}</td>
                                          <td > <button  value={key} onClick={e=>this.clickDelete(e)} className="fa fa-trash"></button> </td>
                                      </tr>
                                    )
                                    }
                                 </tbody>
                                </Table>
                            </Card.Text>

                        <div className="button-curve-add">

                            <SelectCurve curves_list={this.state.curves_list} callbackFromParent={this.myCallback}/>

                        </div>
                    </Card.Body>
                </Card>

            </div>
            <div className="graph-price">
                <div><h3>Precio estimado</h3></div>
                <ResponsiveLine
                            data={this.state.data}
                            margin={{ top: 50, right: 110, bottom: 50, left: 60 }}
                            xScale={{ type: 'point' }}
                            yScale={{ type: 'linear', stacked: true, min: 'auto', max: 'auto' }}
                            axisTop={null}
                            axisRight={null}
                            axisBottom={{
                                orient: 'bottom',
                                tickSize: 5,
                                tickPadding: 5,
                                tickRotation: 0,
                                legend: 'time',
                                legendOffset: 36,
                                legendPosition: 'middle'
                            }}
                            axisLeft={{
                                orient: 'left',
                                tickSize: 5,
                                tickPadding: 5,
                                tickRotation: 0,
                                legend: 'Precio estimado',
                                legendOffset: -55,
                                legendPosition: 'middle'
                            }}
                            colors={{ scheme: 'nivo' }}
                            pointSize={10}
                            pointColor={{ theme: 'background' }}
                            pointBorderWidth={2}
                            pointBorderColor={{ from: 'serieColor' }}
                            pointLabel="y"
                            pointLabelYOffset={-12}
                            useMesh={true}
                            legends={[
                        {
                            anchor: 'bottom-right',
                            direction: 'column',
                            justify: false,
                            translateX: 100,
                            translateY: 0,
                            itemsSpacing: 0,
                            itemDirection: 'left-to-right',
                            itemWidth: 80,
                            itemHeight: 20,
                            itemOpacity: 0.75,
                            symbolSize: 12,
                            symbolShape: 'circle',
                            symbolBorderColor: 'rgba(0, 0, 0, .5)',
                            effects: [
                                {
                                    on: 'hover',
                                    style: {
                                        itemBackground: 'rgba(0, 0, 0, .03)',
                                        itemOpacity: 1
                                    }
                                }
                            ]
                        }
                    ]}
                />

            </div>

      </div>
    );
  }

}

export default Demanda;
