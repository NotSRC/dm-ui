/**
 * @author HypnosNova / https://www.threejs.org.cn/gallery
 * This is a class to check whether objects are in a selection area in 3D space
 * Note: modified for speckle use
 */

export default class SelectionHelper {


  constructor( selectionBox, renderer, cssClassName, controls, mouse, disableSelection = false ) {
    this.element = document.createElement( "div" );
    this.isDown = false;
    this.startPoint = { x: 0, y: 0 };
    this.pointTopLeft = { x: 0, y: 0 };
    this.pointBottomRight = { x: 0, y: 0 };

    this.element.classList.add( cssClassName );
    this.element.style.pointerEvents = "none";

    this.renderer = renderer;
    this.controls = controls
    this.mouse = mouse

    if (!disableSelection) {
      this.renderer.domElement.addEventListener( "mousedown", ( event ) => {
        if ( this.controls.enabled ) return

        this.isDown = true;
        this.onSelectStart( event );
      });

      this.renderer.domElement.addEventListener( "mousemove", ( event ) => {
        if ( this.isDown ) {
          this.onSelectMove( event );
        }
      });

      this.renderer.domElement.addEventListener( "mouseup", ( event ) => {
        this.isDown = false;
        this.onSelectOver( event );
      });
    }

    this.onSelectOver = ( event ) => {
      try {
        this.element.parentElement.removeChild( this.element );
      } catch ( e ) {}
    }

  }

  onSelectStart ( event ) {

    this.renderer.domElement.parentElement.appendChild( this.element )

    const rect = this.renderer.domElement.getBoundingClientRect( );
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    this.element.style.left = x + "px";
    this.element.style.top = y + "px";
    this.element.style.width = "0px";
    this.element.style.height = "0px";

    this.element.style.border = '1px solid #55aaff';
    this.element.style.backgroundColor = 'rgba(255,255,255,0.1)';
    this.element.style.position = 'absolute';
    this.element.style.pointerEvents = 'none';

    this.startPoint.x = x;
    this.startPoint.y = y;
  }

  onSelectMove ( event ) {
    if ( this.controls.enabled ) return

    const rect = this.renderer.domElement.getBoundingClientRect( )
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    this.pointBottomRight.x = Math.max( this.startPoint.x, x );
    this.pointBottomRight.y = Math.max( this.startPoint.y, y );
    this.pointTopLeft.x = Math.min( this.startPoint.x, x );
    this.pointTopLeft.y = Math.min( this.startPoint.y, y );

    this.element.style.left = this.pointTopLeft.x + "px";
    this.element.style.top = this.pointTopLeft.y + "px";
    this.element.style.width = ( this.pointBottomRight.x - this.pointTopLeft.x ) + "px";
    this.element.style.height = ( this.pointBottomRight.y - this.pointTopLeft.y ) + "px";
  }
}
