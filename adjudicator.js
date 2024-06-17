function make_adjudicator() {
    const ORDERTYPE_HOLD = 0;
    const ORDERTYPE_MOVE = 1;
    const ORDERTYPE_SUPPORT = 2;
    const ORDERTYPE_CONVOY = 3;

    /* Possible resolutions of an order. */
    const FAILS = 0;
    const SUCCEEDS = 1;

    return function (orders, nr, resolve) {
        const order = orders[nr];
        const target_nr

        function order_nr_for_location(location) {
            return orders.findIndex(function (o) {
                return o.location === location;
            });
        }

        function has_valid_path() {
            // TODO: depth-first search of convoy orders, or direct adjacency
            return true;
        }

        function determine_attack_strength(target_nr, is_head_to_head) {
            // If the path of the move order is not successful, then the attack strength is 0.
            if (!has_valid_path()) {
                return 0;
            }

            // Otherwise, if the destination is empty, or in a case where there is no
            // head-to-head battle and the unit at the destination has a move order for which
            // the move is successful, then the attack strength is 1 plus the number of
            // successful support orders.
            const target_order = orders[target_nr];
            const is_destination_empty = !target_order;
            if (is_destination_empty ||
                (!is_head_to_head &&
                 target_order.type === ORDERTYPE_MOVE &&
                 resolve(target_nr) === SUCCEEDS))
                {
                    return 1 + orders.filter(function (o, nr) {
                        return o.type === ORDERTYPE_SUPPORT
                            && o.supporttype === ORDERTYPE_MOVE
                            && o.supporting === order.location
                            && o.supportto === order.destination
                            && resolve(nr) === SUCCEEDS;
                    }).length;
                }
        }

        function determine_prevent_strength() {

        }

        function determine_defend_strength() {

        }

        function determine_hold_strength(area) {
            // The hold strength is defined for an area, rather than for an order.

            // The hold strength is 0 when the area is empty...
            const area_order_nr = order_nr_for_location(area);
            if (area_order_nr < 0) {
                return 0;
            }

            // or when it contains a unit that is ordered to move and for which the move succeeds.
            const area_order = orders[area_order_nr];
            if (area_order.type === ORDERTYPE_MOVE) {
                if (resolve(area_order_nr) === SUCCEEDS) {
                    return 0;
                }
                // It is 1 when the area contains a unit that is ordered to move and for which the move fails.
                return 1;
            }

            // In all other cases, it is 1 plus the number of orders that successfully support the unit to hold.
            return 1 + orders
                .filter(function (o, nr) {
                    return o.type === ORDERTYPE_SUPPORT
                        && o.supporttype === ORDERTYPE_HOLD
                        && o.supporting === order.location
                        && resolve(nr) === SUCCEEDS;
                }).length;
        }

        function adjudicate_head_to_head_battle(target_nr) {
            const attack_strength = determine_attack_strength(target_nr, true);
            const defend_strength = determine_defend_strength();
            if (attack_strength <= defend_strength) {
                return FAILS;
            }
            const prevent_strength = determine_prevent_strength();
            if (attack_strength <= prevent_strength) {
                return FAILS;
            }
            return SUCCEEDS;
        }

        function adjudicate_attack() {
            const attack_strength = determine_attack_strength(false);
            const hold_strength = determine_hold_strength();
            if (attack_strength <= hold_strength) {
                return FAILS;
            }
            const prevent_strength = determine_prevent_strength();
            if (attack_strength <= prevent_strength) {
                return FAILS;
            }
            return SUCCEEDS;
        }

        function adjudicate_move() {
            const destination = order.destination;
            const target_nr = order_nr_for_location(destination);
            const target_order = orders[target_nr];
            if (target_order.destination === order.location) {
                // head to head confrontation
                return adjudicate_head_to_head_battle(target_nr);
            }
            return adjudicate_attack();
        }

        if (order.type === ORDERTYPE_MOVE) {
            return adjudicate_move();
        }

        // non-move orders succeed (but could be dislodged)
        return SUCCEEDS;
    }
}