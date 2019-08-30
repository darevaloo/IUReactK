import React, {Component, useState} from 'react';
import { ResponsiveLine } from '@nivo/line';
import Card  from 'react-bootstrap/Card';
import Button  from 'react-bootstrap/Button';
import Table from 'react-bootstrap/Table';
import Modal from 'react-bootstrap/Modal';
import axios from 'axios';
import './production.css';
import {ic_delete} from 'react-icons-kit/md/ic_delete'
import { Icon } from 'react-icons-kit'

const list_name_curves = ["Producción Total", "Producción por granja", "Producción por lote"];

axios.defaults.headers.post['Content-Type'] ='application/json';


function parser_plot(curves_plot){
  var data = [];
  Object.keys(curves_plot).map(function(key){
    var curve = {}
    curve["id"] = key;
    var points = [];
    var i = 0;
    curves_plot[key].map(function(node){
      points.push({"x":i,"y":node});
      i = i +1;
    });
    curve["data"]= points;
    data.push(curve)
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
        curves[e.target.name] = e.target.value.split(",");
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

  treeOption(data,cadena){
    if (!Array.isArray(data)){
      return (<ul className="nested" >{Object.keys(data).map(key=>
                <li >
                   {Array.isArray(data[key]) ? <tr><td><input type="checkbox" onChange={this.handleClick} name={cadena.concat(key)} value={data[key]}/><label>&nbsp;{key}</label></td></tr>:<span className="caret" onClick={this.clickSpan} id={key}>{key}</span>}
                   {this.treeOption(data[key],cadena.concat(key,'/'))}
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

            {this.treeOption(this.props.curves_list,'')}

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

class Production extends Component{

    constructor() {
        super();
        this.state = {
          data: [],
          curves_list: {},
          curves_plot: {},
          isToggleOn: true
        }
        // Este enlace es necesario para hacer que `this` funcione en el callback
        this.handleClick = this.handleClick.bind(this);
        this.myCallback = this.myCallback.bind(this);
        this.clickDelete = this.clickDelete.bind(this);
      }

      componentDidMount() {
          var curveList = this.state.curves_list;

          axios.get("http://167.99.13.15/latest_data/produccion_total/")
          .then(response =>{
            curveList[list_name_curves[0]] = response.data;
            this.setState(state=>({
                curves_list: curveList
            }));
          })
          .catch(error => {
            console.log(error);
          });

          axios.get("http://167.99.13.15/latest_data/produccion_por_granjas/")
          .then(response =>{
            curveList[list_name_curves[1]] = response.data;
            this.setState(state=>({
                curves_list: curveList
            }));
          })
          .catch(error => {
            console.log(error);
          });

        axios.get("http://167.99.13.15/latest_data/produccion_por_lotes/"
      ).then(response =>{
            curveList[list_name_curves[2]] = response.data;
            this.setState(state=>({
                curves_list: curveList
            }));
          })
          .catch(error => {
            console.log(error);
          });


  }



  myCallback = (dataFromChild) => {
      this.setState(state => ({
        curves_plot: dataFromChild,
        data: parser_plot(dataFromChild),
        isToggleOn: !state.isToggleOn
      }));
  }

  clickDelete = (e)=>{
    var curvesPlot = this.state.curves_plot;
    delete curvesPlot[e.target.value];
    this.setState(state => ({
      curves_plot: curvesPlot
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
                Produccion estimada
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
                      legend: 'Producción',
                      legendOffset: -40,
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
                                          <td ><button onClick={this.clickDelete} value={key}><Icon  size={20} icon={ic_delete} /></button> </td>
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
      </div>
    );
  }

}

export default Production;
