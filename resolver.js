/** 
 * Credit to "The Math of Adjudication"
 * by Lucas Kruijswijk
 * https://diplom.org/Zine/S2009M/Kruijswijk/DipMath_Chp6.htm
 * 
 */
function resolve_orders(orders, adjudicater) {
    /* Possible resolutions of an order. */
    const FAILS = 0;
    const SUCCEEDS = 1;

    /* For each order we maintain the resolution. */
    const resolution = [];

    /* The resolution of an order, can be in three states. */
    const UNRESOLVED = 0; /* Order is not yet resolved, the
                           * resolution has no meaningful
                           * value.
                           */
    const GUESSING = 1;   /* The resolution contains a value,
                           * but it is only a guess.
                           */
    const RESOLVED = 2;   /* The resolution contains a value,
                           * and is final.
                           */
    const state = [];
    state.length = orders.length;
    state.fill(UNRESOLVED);

    /* A dependency list is maintained, when a cycle is
     * detected. It is initially empty.
     */
    const dep_list = [];

    /* Function: resolve(nr)
     * nr - The number of the order to be resolved.
     * Returns the resolution for that order.
     */
    function resolve(nr) {

        /* If order is already resolved, just return
          * the resolution.
          */
        if (state[nr] === RESOLVED)
            return resolution[nr];

        if (state[nr] === GUESSING) {
            /* Order is in guess state. Add the order
             * nr to the dependencies list, if it isn't
             * there yet and return the guess.
             */
            if (!dep_list.includes(nr)) {
                /* Order not found, add it. */
                dep_list.push(nr);
            }
            return resolution[nr];
        }
        /* Remember how big the dependency list is before we
         * enter recursion.
         */
        const old_nr_of_dep = dep_list.length;

        /* Set order in guess state. */
        resolution[nr] = FAILS;
        state[nr] = GUESSING;

        /* Adjudicate order. */
        const first_result = adjudicate(nr);

        if (dep_list.length === old_nr_of_dep) {
            /* No orders were added to the dependency list.
             * This means that the result is not dependent
             * on a guess.
             */

            /* Set the resolution (ignoring the initial
             * guess). The order may already have the state
             * RESOLVED, due to the backup rule, acting
             * outside the cycle.
             */
            if (state[nr] !== RESOLVED) {
                resolution[nr] = first_result;
                state[nr] = RESOLVED;
            }
            return first_result;
        }

        if (dep_list[old_nr_of_dep] != nr) {
            /* The order is dependent on a guess, but not our
             * own guess, because it would be the first
             * dependency added. Add to dependency list,
             * update result, but state remains guessing
             */
            dep_list.push(nr);
            resolution[nr] = first_result;
            return first_result;
        }
        /* Result is dependent on our own guess. Set all
         * orders in dependency list to UNRESOLVED and reset
         * dependency list.
         */
        while (dep_list.length > old_nr_of_dep)
            state[dep_list.pop()] = UNRESOLVED;

        /* Do the other guess. */
        resolution[nr] = SUCCEEDS;
        state[nr] = GUESSING;

        /* Adjudicate with the other guess. */
        const second_result = adjudicate(nr);

        if (first_result === second_result) {
            /* Although there is a cycle, there is only
             * one resolution. Cleanup dependency list first.
             */
            while (dep_list.length > old_nr_of_dep)
                state[dep_list.pop()] = UNRESOLVED;
            /* Now set the final result and return. */
            resolution[nr] = first_result;
            state[nr] = RESOLVED;
            return first_result;
        }
        /* There are two or no resolutions for the cycle.
         * Pass dependencies to the backup rule.
         * These are dependencies with index in range
         * [old_nr_of_dep, nr_of_dep - 1]
         * The backup_rule, should clean up the dependency
         * list (setting nr_of_dep to old_nr_of_dep). Any
         * order in the dependency list that is not set to
         * RESOLVED should be set to UNRESOLVED.
         */
        backup_rule(old_nr_of_dep);

        /* The backup_rule may not have resolved all
         * orders in the cycle. For instance, the
         * Szykman rule, will not resolve the orders
         * of the moves attacking the convoys. To deal
         * with this, we start all over again.
         */
        return resolve(nr);
    }

    function adjudicate(nr) {
        return adjudicater(orders, nr, resolve);
    }

    function backup_rule(nr) {
        throw new Error("Backup rule not implemented");
    }

    for (let nr = 0; nr < orders.length; nr++) {
        resolve(nr);
    }

    return resolution;
}