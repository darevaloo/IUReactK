import React, {Component, useState} from 'react';
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

const list_name_curves = ["Producción Total", "Producción por granja", "Producción por lote"];

axios.defaults.headers.post['Content-Type'] ='application/json';


const root = [
  {
    "Raoul": 113,
    "Josiane": 80,
    "Marcel": 106,
    "René": 168,
    "Paul": 66,
    "Jacques": 174
  },
  {
    "Raoul": 156,
    "Josiane": 141,
    "Marcel": 122,
    "René": 71,
    "Paul": 167,
    "Jacques": 127
  },
  {
    "Raoul": 93,
    "Josiane": 196,
    "Marcel": 45,
    "René": 50,
    "Paul": 81,
    "Jacques": 78
  },
  {
    "Raoul": 176,
    "Josiane": 18,
    "Marcel": 39,
    "René": 106,
    "Paul": 192,
    "Jacques": 38
  },
  {
    "Raoul": 110,
    "Josiane": 135,
    "Marcel": 28,
    "René": 35,
    "Paul": 167,
    "Jacques": 80
  },
  {
    "Raoul": 101,
    "Josiane": 38,
    "Marcel": 16,
    "René": 147,
    "Paul": 68,
    "Jacques": 200
  },
  {
    "Raoul": 179,
    "Josiane": 17,
    "Marcel": 91,
    "René": 194,
    "Paul": 160,
    "Jacques": 48
  },
  {
    "Raoul": 62,
    "Josiane": 181,
    "Marcel": 147,
    "René": 77,
    "Paul": 145,
    "Jacques": 65
  },
  {
    "Raoul": 62,
    "Josiane": 12,
    "Marcel": 10,
    "René": 113,
    "Paul": 39,
    "Jacques": 77
  }
]
function parser_stream(curves_plot){
  var data = [];
  var i = 0;
  for (var j = 0; j < 15; j++) {
   data.push({});
  };
  Object.keys(curves_plot).map(function(key){
    Object.keys(curves_plot[key]).map(function(k){

      i = 0;
      curves_plot[key][k]["DEMAND_HIGH"].map(function(node){
        data[i][k]=node;
        i = i +1;
      });

    });

  });
  return data;
}

function parser_plot(curves_plot){
  var data = [];
  Object.keys(curves_plot).map(function(key){
    Object.keys(curves_plot[key]).map(function(k){
      var curve = {}
      curve["id"] = k;
      var points = [];
      var i = 0;
      curves_plot[key][k]["PRICE"].map(function(node){
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
        keys.map(k=>{
          data = data[k]
        });
        curves[e.target.name] = data;
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
                   {deep === 2 ? <tr><td><input type="checkbox" onChange={this.handleClick} name={cadena.concat(key)} value={cadena.concat(key)}/><label>&nbsp;{key}</label></td></tr>:<span className="caret" onClick={this.clickSpan} id={key}>{key}</span>}
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



  handleClick() {
    this.setState(state => ({
      isToggleOn: !state.isToggleOn
    }));
  }

  render(){
    return (

      <div className="content">

            <div className="graph-production">
                Demanda Estimada
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
                                        <th stye="width:5px"> </th>
                                        <th> Nombre curva</th>
                                        <th>  </th>
                                    </tr>
                                    {Object.keys(this.state.curves_plot).map(key=>
                                      <tr key={key}>
                                          <td stye="width:5px" > <div id="circle"></div></td>
                                          <td> {key}</td>
                                          <td onClick={this.clickSpan}> <Icon size={30} icon={ic_delete} /> </td>
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
                <div>Precio estimado</div>
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
