import { TimelineTrack } from './TimelineTrack';
import React, { useCallback, useState } from 'react';
import { TimelineStore } from './TimelineStore';
import _ from 'lodash';
import { observer } from 'mobx-react';
import { Portal } from 'react-overlays/lib';
import { Popover } from 'react-bootstrap';
import { flattenTracks, sortNestedTracks } from './lib/helpers';
import CustomTrack, { CustomTrackSpecification } from './CustomTrack';
import { TICK_AXIS_HEIGHT } from './TickAxis';
import { useObserver } from 'mobx-react-lite';
import { getBrowserWindow } from 'cbioportal-frontend-commons';

export interface ITimelineTracks {
    store: TimelineStore;
    width: number;
    handleTrackHover: (e: React.MouseEvent<SVGGElement>) => void;
    customTracks?: CustomTrackSpecification[];
    visibleTracks?: string[];
}

export const TimelineTracks: React.FunctionComponent<ITimelineTracks> = observer(
    function({ store, width, handleTrackHover, customTracks, visibleTracks }) {
        const tracks = store.data;
        let nextY = 0;

        return (
            <>
                <g transform={`translate(0 ${TICK_AXIS_HEIGHT})`}>
                    {tracks.map(track => {
                        const isTrackVisible =
                            visibleTracks === undefined ||
                            visibleTracks.includes(track.track.type);

                        const y = nextY;

                        nextY += isTrackVisible ? track.height : 0;

                        if (isTrackVisible) {
                            return (
                                <TimelineTrack
                                    limit={store.trimmedLimit}
                                    trackData={track.track}
                                    getPosition={store.getPosition}
                                    handleTrackHover={handleTrackHover}
                                    store={store}
                                    y={y}
                                    height={track.height}
                                    width={width}
                                />
                            );
                        } else {
                            return null;
                        }
                    })}
                    {customTracks &&
                        customTracks.map(track => {
                            const y = nextY;
                            nextY += track.height(store);
                            return (
                                <CustomTrack
                                    store={store}
                                    specification={track}
                                    handleTrackHover={handleTrackHover}
                                    width={width}
                                    y={y}
                                    disableHover={track.disableHover}
                                />
                            );
                        })}
                </g>
                {store.tooltipModels.map(([uid, model, index]) => {
                    const position = model.position || store.mousePosition;
                    // if the x offset is great than half the screen, then position
                    // tooltip to the left
                    let placementLeft =
                        position.x / getBrowserWindow().outerWidth > 0.5;
                    return (
                        <Portal container={document.body}>
                            <Popover
                                onMouseEnter={() => {
                                    store.togglePinTooltip(uid);
                                }}
                                onMouseLeave={() => {
                                    store.removeTooltip(uid);
                                }}
                                arrowOffsetTop={17}
                                placement={placementLeft ? 'left' : 'right'}
                                style={{
                                    transform: placementLeft
                                        ? 'translate(-100%, 0)'
                                        : '',
                                }}
                                className={'tl-timeline-tooltip cbioTooltip'}
                                positionLeft={
                                    //position.x
                                    position.x + (placementLeft ? -3 : 3)
                                }
                                positionTop={position.y - 17}
                            >
                                {store.getTooltipContent(uid, model, index)}
                            </Popover>
                        </Portal>
                    );
                })}
            </>
        );
    }
);

export default TimelineTracks;
