function make_adjudicator() {
    const ORDERTYPE_HOLD = 0;
    const ORDERTYPE_MOVE = 1;
    const ORDERTYPE_SUPPORT = 2;
    const ORDERTYPE_CONVOY = 3;

    /* Possible resolutions of an order. */
    const FAILS = 0;
    const SUCCEEDS = 1;

    function order_nr_for_location(orders) {
        return orders.findIndex(function (o) {
            return o.location === destination;
        });
    }

    return function (orders, nr, resolve) {
        const order = orders[nr];

        function has_valid_path() {
            return true;
        }

        function determine_attack_strength(is_head_to_head) {
            if (!has_valid_path()) {
                return 0;
            }
            
        }

        function determine_prevent_strength() {

        }

        function determine_defend_strength() {

        }

        function determine_hold_strength() {

        }

        function adjudicate_head_to_head_battle() {
            const attack_strength = determine_attack_strength();
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
            const attack_strength = determine_attack_strength();
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
                return adjudicate_head_to_head_battle();
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